import { useDispatch, useSelector } from 'react-redux'
import { useGetUsersActiveTradesQuery } from '../../../../../../features/Trades/TradeSliceApi'
import ActiveTradeBlockWrapper from './Components/ActiveTradeBlockWrapper'
import './TradeBlockContainer.css'
import './TradePriceVisualAlert.css'

import ActiveTradeListWrapper from './Components/ListView/ActiveTradeListWrapper'
import AccountPLVisual from '../AccountPLVisual/AccountPLVisual'
import { isWeekend } from 'date-fns'
import { ScoringTestHUD } from '../../../MacroControlSection/Components/WatchListEngine/ScoringTestHUD'
import { selectActiveTradeResults } from '../../../../../../features/Engine/EnginePlanApiSlice'

function CurrentTradePositionContainer()
{
    let isWeekendPollingInterval = isWeekend(new Date()) ? 0 : 30000
    // const { data: activeTrades, isSuccess, isLoading, isError, error, refetch } = useGetUsersActiveTradesQuery(undefined,        { pollingInterval: isWeekendPollingInterval })
    const { data: activeTrades, isSuccess, isLoading, isError, error, refetch } = useGetUsersActiveTradesQuery()


    const trades = useSelector(state => selectActiveTradeResults(state))
    console.log(trades)



    let tradeDisplayContent
    // if (isSuccess && activeTrades.ids.length > 10) { tradeDisplayContent = <ActiveTradeListWrapper ids={activeTrades.ids} refetch={refetch} /> }
    // else
    if (isSuccess && activeTrades.ids.length > 0) { tradeDisplayContent = <ActiveTradeBlockWrapper ids={activeTrades.ids} refetch={refetch} /> }
    else if (isSuccess) { tradeDisplayContent = <div className='LSH-ActiveTradesMessage'><h2>No Active Trades</h2></div> }
    else if (isLoading) { tradeDisplayContent = <div className='LSH-ActiveTradeMessage'><h2>Loading Current Trades...</h2></div> }
    else if (isError) { tradeDisplayContent = <div><h2>Error Fetching Trades</h2><button onClick={() => refetch()}>Retry</button></div> }

    return (
        <div id='LSH-ActiveTradeContainer'>
            {tradeDisplayContent}
        </div>
    )
}

export default CurrentTradePositionContainer