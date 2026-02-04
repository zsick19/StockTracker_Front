import io from 'socket.io-client'

// Create a singleton to manage the single WebSocket connection
let listeners = { 'enterExitWatchListPrice': [], 'activeTradePrice': [], 'macroWatchList': [], 'singleLiveChart': [] }
let listenersCount = { 'enterExitWatchListPrice': 0, 'activeTradePrice': 0, 'macroWatchList': 0, 'singleLiveChart': 0 }
let ws;

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
        listenersCount[channel] = listenersCount[channel] + 1
    };

    const unsubscribe = (channel, callback, userId, source, ticker, connectionId) =>
    {
        if (source === 'tempLiveChart')
        {
            let moreThanOneTicker = listeners[channel].filter(t => t.ticker === ticker).length > 1
            listeners[channel] = listeners[channel].filter((t) => t.connectionId !== connectionId)
            listenersCount[channel] = listenersCount[channel] - 1
            if (!moreThanOneTicker) ws.emit('disconnectTempStream', { userId, tickerSymbol: ticker })
        } else
        {
            listeners[channel] = listeners[channel].filter((t) => t.source !== source)
            listenersCount[channel] = listenersCount[channel] - 1
        }
    }

    return { getWebSocket, subscribe, unsubscribe };
};





