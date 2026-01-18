import { useDispatch, useSelector } from 'react-redux'
import { selectTradeChartStock } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import TradePresent from './Components/TradePresent'
import PreTradePlanPresent from './Components/PreTradePlanPresent'
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import './EnterExitTradeGraph.css'
import TradeGraphChartWrapper from './Components/TradeGraphChartWrapper'
import { useState } from 'react'
import { defaultTimeFrames, interDayTimeFrames } from '../../../../../../Utilities/TimeFrames'
import { CalendarCog, Scale3D } from 'lucide-react'

function EnterExitTradeGraph()
{
    const dispatch = useDispatch()
    const selectedStock = useSelector(selectTradeChartStock)

    const [timeFrame, setTimeFrame] = useState(selectedStock?.timeFrame || defaultTimeFrames.threeDayOneMin)
    return (
        <div id='LHS-TradeRecord'>
            <div id='LHS-SingleGraphMenuBar'>
                {selectedStock?.ticker || 'No ticker selected'}
                {/* <button onClick={() => { setShowStudiesModal(true) }}>Studies</button> */}
                {/* <button onClick={() => { setShowVisibilityModal(true) }} title='Visibility Control'><EyeOff size={20} /></button> */}

                <div className='IntraDayTimeFrameBtns'>
                    {interDayTimeFrames.map((timeFrame) => { return <button onClick={() => setTimeFrame(timeFrame.timeFrame)}>{timeFrame.label}</button> })}
                    <button onClick={() => { setShowCustomTimeFrameModal(true) }}><CalendarCog size={20} /></button>
                </div>
                <button onClick={() => handleResetScale()} className='buttonIcon'><Scale3D color='white' size={20} /></button>
            </div>

            <TradeGraphChartWrapper selectedStock={selectedStock} />
            <div id='LHS-PlanPresentBeforeTrade'>
                {selectedStock?.planId ?
                    selectedStock?.trade ?
                        <TradePresent selectedStock={selectedStock} /> :
                        <PreTradePlanPresent selectedStock={selectedStock} />
                    : <div>
                        No Enter Exit plan for this ticker
                        <div>
                            <button onClick={() => dispatch(setStockDetailState(5))}>Ticker To Plan</button>
                        </div>
                    </div>}
            </div>
        </div>
    )
}

export default EnterExitTradeGraph