import { useDispatch } from 'react-redux'
import { useGetUsersActiveTradesQuery } from '../../../../../../../features/Trades/TradeSliceApi'
import ActiveTradeBlockWrapper from './Components/ActiveTradeBlockWrapper'
import './TradeBlockContainer.css'
import './TradePriceVisualAlert.css'
import AccountPLVisual from './Components/AccountPLVisual'

function CurrentTradePositionContainer()
{
    const dispatch = useDispatch()

    const { data: activeTrades, isSuccess, isLoading, isError, error, refetch } = useGetUsersActiveTradesQuery()



    let tradeDisplayContent
    if (isSuccess && activeTrades.ids.length > 0)
    {
        tradeDisplayContent = <ActiveTradeBlockWrapper ids={activeTrades.ids} />
    } else if (isSuccess)
    {
        tradeDisplayContent = <div className='LSH-ActiveTradesMessage'>
            <h2>Currently No Active Trades</h2>
        </div>
    }
    else if (isLoading) { tradeDisplayContent = <div className='LSH-ActiveTradeMessage'><h2>Loading Current Trades...</h2></div> }
    else if (isError)
    {
        tradeDisplayContent = <div>
            <h2>Error Fetching Trades</h2>
            <button onClick={() => refetch()}>Retry</button>
        </div>
    }




    return (
        <div id='LSH-ActiveTradeContainer'>
            <AccountPLVisual />
            {tradeDisplayContent}
        </div>
    )
}

export default CurrentTradePositionContainer