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
import SingleActiveTradeBlock from './Components/SingleActiveTradeBlock'

function CurrentTradePositionContainer()
{
    const dispatch = useDispatch()
    const trades = useSelector(state => selectActiveTradeResults(state))

    return (

        <div id='LSH-ActiveTradeContainer'>

            <div id='LSH-ActiveTradeBlockWrapper' className='hide-scrollbar' onContextMenu={(e) => { e.preventDefault(); dispatch(setStockDetailState(18)) }}>
                {trades.length > 0 ?
                    trades.map((activeTrade) => <SingleActiveTradeBlock trade={activeTrade} key={`activeTrade${activeTrade.tickerSymbol}`} />) :
                    <div className='LSH-ActiveTradesMessage'><h2>No Active Trades</h2></div>
                }
            </div>

        </div>
    )
}

export default CurrentTradePositionContainer