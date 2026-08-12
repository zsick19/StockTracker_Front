import io from 'socket.io-client'
// import { store } from '../store';
import { addSTDDaily } from '../../features/STDs/StockDetailControlSlice';
import { addPriceAlert, removeQuickAlert } from '../../features/PriceAlerts/PriceAlertControlSlice';
import { toZonedTime } from 'date-fns-tz';
import { isWeekend, isWithinInterval, set } from 'date-fns';
import { setMonitorDisconnectionMessage } from '../../features/Initializations/StreamMostRecentSlice';
import { initiateNewsRunnerWatch, setIncomingNewsAlertPrice, setIncomingNewsAlertQuote } from '../../features/NewsRunnerEngine/NewsRunnerLocalSlice';
import { NewsRunnerApiSlice } from '../../features/NewsRunnerEngine/NewsRunnerApiSlice';

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
                    setTimeout(async () =>
                    {
                        const latestState = store.getState();
                        const ticker = payload.ticker
                        console.log(latestState)
                        const newsAlertWatch = latestState.newsRunnerSlice.entities[ticker];
                        console.log(newsAlertWatch)
                        // 4. Condition Check: Did the high-speed Alpaca stream fail to trigger a breakout?
                        if (newsAlertWatch && newsAlertWatch.status === 'quite')
                        {
                            console.log(`[TIMEOUT] $${ticker} remained dead for 45s. Running cleanup mutation...`);

                            try
                            {
                                // 5. Trigger the RTK Query mutation programmatically from your raw JS file
                                // .initiate() returns a thunk action creator that must be dispatched
                                await store.dispatch(NewsRunnerApiSlice.endpoints.clearNewsRunnerData.initiate({ tickerSymbol: ticker })).unwrap();

                                console.log(`[TIMEOUT SUCCESS] Successfully cleaned up $${ticker}`);
                            } catch (error)
                            {
                                console.error(`[TIMEOUT ERROR] Failed to execute cleanup mutation for $${ticker}:`, error);
                            }
                        } else
                        {
                            console.log(`[TIMEOUT BYPASS] $${ticker} broke out or was already handled. No cleanup needed.`);
                        }

                    }, [45000])
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







