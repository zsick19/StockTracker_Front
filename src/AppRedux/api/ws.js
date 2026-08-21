import io from 'socket.io-client'
import { addSTDDaily } from '../../features/STDs/StockDetailControlSlice';
import { addPriceAlert, removeQuickAlert } from '../../features/PriceAlerts/PriceAlertControlSlice';
import { toZonedTime } from 'date-fns-tz';
import { isAfter, isBefore, isWeekend, isWithinInterval, set } from 'date-fns';
import { setMonitorDisconnectionMessage } from '../../features/Initializations/StreamMostRecentSlice';
import { initiateNewsRunnerWatch, setIncomingNewsAlertPrice, setIncomingNewsAlertQuote } from '../../features/NewsRunnerEngine/NewsRunnerLocalSlice';
import { NewsRunnerApiSlice } from '../../features/NewsRunnerEngine/NewsRunnerApiSlice';
import { preSetDailyTimes } from '../../Utilities/TimeFrames';

// Create a singleton to manage the single WebSocket connection
let listeners = {
    'enterExitWatchListPrice': [],
    'activeTradePrice': [],
    'macroWatchListUpdate': [],
    'singleLiveChart': [],
    'engineLivePrice': [],
    'quoteLivePrice': []
}
let ws;
let store;

const centralNewsWatchRegistry = new Map()
let candleFetchInterval = 0
setInterval(async () =>
{
    const now = Date.now();
    let stockInfoFetch = [] //initial pull for stock info and candles
    let firstMinVolumeCheck = []; //snapshots the first 60 seconds

    let candleFetchStock = []; //continual pull for stock candles on 30 second intervals
    let tradeQuotePromises = []; //5 second trade and quote pull

    let cleanupPromises = [];//clear ticker 

    // const latestState = store.getState();

    for (const [ticker, data] of centralNewsWatchRegistry.entries())
    {
        if (!data.stockInfoAndInitialTradesFetched)
        {
            stockInfoFetch.push(ticker)
            data.stockInfoAndInitialTradesFetched = true
        } else
        {
            if (now - data.timestamp < 180000) { firstMinVolumeCheck.push(ticker) }
            else { tradeQuotePromises.push(ticker) }
        }

        if (candleFetchInterval === 6) { candleFetchStock.push(ticker) }

        if (now - data.timestamp >= 120000)
        {

            const newsAlertWatch = store.getState().newsRunnerSlice.entities[ticker];
            if (!newsAlertWatch) centralNewsWatchRegistry.delete(ticker)
            else if ((newsAlertWatch.status === 'INITIALIZING' || newsAlertWatch.status === 'FLAT') ||
                (newsAlertWatch.status === 'LARGEVOLUME' && newsAlertWatch.percentChangeFromOriginal < 0.25))
            {
                cleanupPromises.push(store.dispatch(NewsRunnerApiSlice.endpoints.clearNewsRunnerData.initiate({ tickerSymbol: ticker })).unwrap().catch(error => console.error(`Cleanup failed for $${ticker}:`, error)));
                centralNewsWatchRegistry.delete(ticker);
            }
        }
    }

    if (candleFetchInterval < 6) { candleFetchInterval += 1 } else { candleFetchInterval = 0 }

    if (stockInfoFetch.length > 0)
    {
        try { await store.dispatch(NewsRunnerApiSlice.endpoints.fetchNewsRunnerInfo.initiate({ tickersToFetch: stockInfoFetch })).unwrap() }
        catch (error) { console.error(`Stock Info Fetch failed`, error) }
    }
    if (firstMinVolumeCheck.length > 0)
    {
        try { await store.dispatch(NewsRunnerApiSlice.endpoints.fetchNewsRunnerVolumePriceChecks.initiate({ tickerSymbol: firstMinVolumeCheck })).unwrap() }
        catch (error) { console.error(`Price fetch failed`, error) }
    }

    if (candleFetchStock.length > 0)
    {
        try { await store.dispatch(NewsRunnerApiSlice.endpoints.fetchNewsRunnerCandleData.initiate({ tickerSymbol: candleFetchStock })).unwrap() }
        catch (error) { console.log('Error fetching candle Data') }
    }

    if (tradeQuotePromises.length > 0)
    {
        try { await store.dispatch(NewsRunnerApiSlice.endpoints.fetchNewsRunnerQuotesAndTrades.initiate({ tickerSymbol: tradeQuotePromises })).unwrap() }
        catch (error) { console.error(`Price fetch failed`, error) }
    }

    if (cleanupPromises.length > 0)
    {
        try { await Promise.all(cleanupPromises) }
        catch (error) { console.log(`News Runner clean up error`, error) };
    }
}, 5000);



export const injectStore = (_store) => { store = _store }

export const setupWebSocket = () =>
{
    const getWebSocket = (userId, queryRoute) =>
    {
        if (!ws)
        {
            ws = io.connect('http://localhost:8080')
            ws.on('connect', () => { ws.emit('user_logon', userId) })

            ws.onAny((eventName, payload) =>
            {
                if (eventName in listeners) { listeners[eventName].map((fnSource, i) => { fnSource.fn(payload) }) }
                // if (eventName === 'coreSTDHit' && store) { store.dispatch(addSTDDaily(payload)) }
                // if (eventName === 'priceAlert' && store)
                // {
                //     store.dispatch(addPriceAlert(payload))
                //     setTimeout(() =>
                //     {
                //         store.dispatch(removeQuickAlert(payload))
                //     }, 3000);
                // }
                if (eventName === 'newsAlertPriceStream') { store.dispatch(setIncomingNewsAlertPrice(payload)) }
                if (eventName === 'newsAlertQuoteStream') { store.dispatch(setIncomingNewsAlertQuote(payload)) }
                if (eventName === 'highAlertNewsTicker')
                {
                    store.dispatch(initiateNewsRunnerWatch(payload))
                    centralNewsWatchRegistry.set(payload.ticker, {
                        timestamp: Date.now(),
                        priceFetched: false,
                        candlesFetchedOnInterval: false,
                        stockInfoAndInitialTradesFetched: false,
                        largeOrderThresholdEstablished: false,
                    });
                }
                if (eventName === 'monitorError' && store) { store.dispatch(setMonitorDisconnectionMessage(payload)) }
            })

            ws.on('disconnect', () =>
            {
                console.log('WebSocket closed. Reconnecting...');
                ws = null;
            });//Reset connection to allow new one
        }

        console.log(`${queryRoute} connected to socket`)
        return ws;
    };

    const subscribe = (channel, callback, source, ticker, connectionId) =>
    {
        listeners[channel].push({ fn: callback, source, ticker, connectionId })
    };

    const unsubscribe = (channel, callback, userId, source, ticker, connectionId) =>
    {
        if (source === 'tempLiveChart')
        {
            let moreThanOneTicker = listeners[channel].filter(t => t.ticker === ticker).length > 1
            listeners[channel] = listeners[channel].filter((t) => t.connectionId !== connectionId)
            if (!moreThanOneTicker) ws.emit('disconnectTempStream', { userId, tickerSymbol: ticker })
        } else
        {
            listeners[channel] = listeners[channel].filter((t) => t.source !== source)
        }

    }

    const checkStreamAuthorization = () =>
    {
        const systemTime = new Date();
        const nyTime = toZonedTime(systemTime, 'America/New_York')

        const streamOpenBarrier = set(nyTime, { hours: 7, minutes: 30, seconds: 0, milliseconds: 0 });
        const streamCloseBarrier = set(nyTime, { hours: 16, minutes: 30, seconds: 0, milliseconds: 0 });

        return !isWeekend(nyTime) && isWithinInterval(nyTime, { start: streamOpenBarrier, end: streamCloseBarrier });
    }

    return { getWebSocket, subscribe, unsubscribe, checkStreamAuthorization };
};







