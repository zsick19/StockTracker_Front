import React, { useState } from 'react'
import './ActiveTradeAndWatchList.css'
import PreTradeWatchList from './WatchList/PreTradeWatchList'
import CurrentTradePositionContainer from './TradeBlockContainer/CurrentTradePositionContainer'
import PreTradeBlockContainer from './TradeBlockContainer/PreTradeBlockContainer'
import ActiveTradeAsWatchList from './WatchList/ActiveTradeAsWatchList'

function ActiveTradeAndWatchList()
{
    const [activeTradeLarger, setActiveTradeLarger] = useState(true)

    return (
        <div id='LSH-ActiveTradeLarger'>
            {activeTradeLarger ? <PreTradeWatchList setActiveTradeLarger={setActiveTradeLarger} /> : <ActiveTradeAsWatchList setActiveTradeLarger={setActiveTradeLarger} />}
            {activeTradeLarger ? <CurrentTradePositionContainer /> : <PreTradeBlockContainer />}
        </div >
    )
}

export default ActiveTradeAndWatchList