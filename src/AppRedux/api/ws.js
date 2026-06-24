import io from 'socket.io-client'
// import { store } from '../store';
import { addSTDDaily } from '../../features/STDs/StockDetailControlSlice';
import { addPriceAlert, removeQuickAlert } from '../../features/PriceAlerts/PriceAlertControlSlice';
import { toZonedTime } from 'date-fns-tz';
import { isWeekend, isWithinInterval, set } from 'date-fns';

// Create a singleton to manage the single WebSocket connection
let listeners = {
    'enterExitWatchListPrice': [],
    'activeTradePrice': [],
    'macroWatchListUpdate': [],
    'singleLiveChart': [],
    'engineLivePrice': []
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
                if (eventName === 'coreSTDHit' && store) { store.dispatch(addSTDDaily(payload)) }
                if (eventName === 'priceAlert' && store)
                {
                    store.dispatch(addPriceAlert(payload))
                    setTimeout(() =>
                    {
                        store.dispatch(removeQuickAlert(payload))
                    }, 3000);
                }
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







