import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useGetUsersActiveTradesQuery } from '../../../../../../features/Trades/TradeSliceApi'
import ActiveTradeBlockWrapper from './Components/ActiveTradeBlockWrapper'
import './TradeBlockContainer.css'
import './TradePriceVisualAlert.css'

import ActiveTradeListWrapper from './Components/ListView/ActiveTradeListWrapper'
import AccountPLVisual from '../AccountPLVisual/AccountPLVisual'
import { isWeekend } from 'date-fns'
import { ScoringTestHUD } from '../../../MacroControlSection/Components/WatchListEngine/ScoringTestHUD'
import { selectActiveTradeResultIds, selectActiveTradeResults } from '../../../../../../features/Engine/EnginePlanApiSlice'
import SingleActiveTradeBlock from './Components/SingleActiveTradeBlock'
import { useMemo } from 'react'

function CurrentTradePositionContainer()
{
    const dispatch = useDispatch()

    const activeTradeIds = useSelector((state) => selectActiveTradeResults(state))

    return (

        <div id='LSH-ActiveTradeContainer'>

            <div id='LSH-ActiveTradeBlockWrapper' className='hide-scrollbar' onContextMenu={(e) => { e.preventDefault(); dispatch(setStockDetailState(18)) }}>
                {activeTradeIds.length > 0 ?
                    activeTradeIds.map((tradeTickerId) => <SingleActiveTradeBlock activeTrade={tradeTickerId} key={`activeTrade${tradeTickerId.tickerSymbol}`} />) :
                    <div className='LSH-ActiveTradesMessage'><h2>No Active Trades</h2></div>
                }
            </div>

        </div>
    )
}

export default CurrentTradePositionContainer