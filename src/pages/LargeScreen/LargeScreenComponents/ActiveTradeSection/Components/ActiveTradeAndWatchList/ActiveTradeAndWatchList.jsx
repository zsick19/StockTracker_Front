import React, { useState } from 'react'

function ActiveTradeAndWatchList()
{
    const [activeTradeLarger, setActiveTradeLarger] = useState(true)

    return (
        <div className={activeTradeLarger ? 'LSH-ActiveTradeLarger' : 'LSH-PreTradeLarger'}>
            <div>
                <div>Buffer Hit List</div>
                <div>Stoploss hit List</div>
                <div>WatchList general</div>
            </div>

            <div>
                active trade blocks
            </div>

        </div>
    )
}

export default ActiveTradeAndWatchList