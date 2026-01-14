import React, { useState } from 'react'
import './ActiveTradeAndWatchList.css'
import PreTradeWatchList from './WatchList/PreTradeWatchList'
import CurrentTradePositionContainer from './TradeBlockContainer/CurrentTradePositionContainer'
import PreTradeBlockContainer from './TradeBlockContainer/PreTradeBlockContainer'
import ActiveTradeAsWatchList from './WatchList/ActiveTradeAsWatchList'
import { useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'

function ActiveTradeAndWatchList()
{
    const [activeTradeLarger, setActiveTradeLarger] = useState(true)
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersEnterExitPlanQuery()


    let preTradeWatchListContent
    if (isSuccess)
    {
        preTradeWatchListContent = <PreTradeWatchList setActiveTradeLarger={setActiveTradeLarger} refetch={refetch} />
    } else if (isLoading)
    {
        preTradeWatchListContent = <div>Loading...</div>
    } else if (isError)
    {
        preTradeWatchListContent = <div>Error...
            <button onClick={() => refetch()}>refetch</button>
        </div>
    }


    return (
        <div id='LSH-ActiveTradeLarger'>
            {activeTradeLarger ? preTradeWatchListContent : <ActiveTradeAsWatchList setActiveTradeLarger={setActiveTradeLarger} />}
            {activeTradeLarger ? <CurrentTradePositionContainer /> : <PreTradeBlockContainer />}
        </div >
    )
}

export default ActiveTradeAndWatchList