import io from 'socket.io-client'

// Create a singleton to manage the single WebSocket connection
let listeners = { 'enterExitWatchListPrice': [] }
let listenersCount = { 'enterExitWatchListPrice': 0 }
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
                console.log(eventName, payload)
                if (eventName in listeners)
                {
                    console.log(eventName, payload)
                    listeners[eventName].map((fnSource, i) => { fnSource.fn(payload) })
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

    const subscribe = (channel, callback, source) =>
    {
        listeners[channel].push({ fn: callback, source })
        listenersCount[channel] = listenersCount[channel] + 1
    };

    const unsubscribe = (channel, callback, userId, source) =>
    {
        listeners[channel] = listeners[channel].filter((t) => t.source !== source)
        listenersCount[channel] = listenersCount[channel] - 1

        ws.emit('disconnectedStream', { userId, source })
        console.log(`${source} unsubscribed from web socket`)
    }

    return { getWebSocket, subscribe, unsubscribe };
};





