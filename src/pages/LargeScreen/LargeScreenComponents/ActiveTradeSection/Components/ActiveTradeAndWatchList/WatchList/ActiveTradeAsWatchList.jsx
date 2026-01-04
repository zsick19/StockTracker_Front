import React from 'react'

function ActiveTradeAsWatchList({ setActiveTradeLarger })
{
    return (
        <div id='LSH-ActiveTradeAsList'>
            ActiveTradeAsWatchList
            <button onClick={() => setActiveTradeLarger(prev => !prev)}>Active Trade Blocks</button>
        </div>
    )
}

export default ActiveTradeAsWatchList