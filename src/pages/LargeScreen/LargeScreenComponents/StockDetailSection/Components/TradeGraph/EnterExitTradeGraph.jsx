import { useDispatch, useSelector } from 'react-redux'
import { selectTradeChartStock } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import TradePresent from './Components/TradePresent'
import PreTradePlanPresent from './Components/PreTradePlanPresent'
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import './EnterExitTradeGraph.css'
import TradeGraphChartWrapper from './Components/TradeGraphChartWrapper'
import { useEffect, useMemo, useState } from 'react'
import { defaultTimeFrames } from '../../../../../../Utilities/TimeFrames'
import { FlaskConical, LineSquiggle, Scale3D } from 'lucide-react'
import * as short from 'short-uuid'
import { clearGraphControl, setInitialGraphControl, setResetXYZoomState } from '../../../../../../features/Charting/GraphHoverZoomElement'
import TimeFrameDropDown from '../../../../../../components/ChartMenuDropDowns/TimeFrameDropDown'
import StudySelectPopover from '../../../../../../components/ChartMenuDropDowns/StudySelectPopover'

function EnterExitTradeGraph()
{
    const dispatch = useDispatch()

    const [showTimeFrameSelect, setShowTimeFrameSelect] = useState(false)
    const [showStudiesSelect, setShowStudiesSelect] = useState(false)

    const selectedStock = useSelector(selectTradeChartStock)
    const [timeFrame, setTimeFrame] = useState(selectedStock?.timeFrame || defaultTimeFrames.threeDayOneMin)
    const uuid = useMemo(() => short.generate(), [])

    useEffect(() =>
    {
        dispatch(setInitialGraphControl(uuid))
        return (() => { if (uuid) dispatch(clearGraphControl(uuid)) })
    }, [])


    return (
        <div id='LHS-TradeRecord'>
            <div id='LHS-SingleGraphMenuBar'>
                {/* {showTimeFrameSelect && <TimeFrameDropDown handleTimeFrameChange={handleTimeFrameChange} setShowTimeFrameSelect={setShowTimeFrameSelect} />} */}
                {/* {showStudiesSelect && <StudySelectPopover handleStudySelectChange={handleStudySelectChange} setShowStudiesSelect={setShowStudiesSelect} />} */}

                <h3>{selectedStock?.tickerSymbol || 'No ticker selected'}</h3>
                <button className='timeFrameButton' onClick={() => { setShowTimeFrameSelect(true); setShowStudiesSelect(false) }}>{timeFrame.increment}{timeFrame.unitOfIncrement}</button>
                <button className='buttonIcon' onClick={() => { setShowTimeFrameSelect(false); setShowStudiesSelect(true) }}><FlaskConical size={18} color='white' /></button>
                <button className='buttonIcon'><LineSquiggle color='white' size={18} /></button>



                {/* {showTimeFrameSelect && <TimeFrameDropDown />} */}
                <button onClick={() => dispatch(setResetXYZoomState({ uuid }))} className='buttonIcon'><Scale3D color='white' size={20} /></button>
            </div>

            {selectedStock ? <TradeGraphChartWrapper selectedStock={selectedStock} uuid={uuid} timeFrame={timeFrame} /> : <div></div>}

            <div id='LHS-PlanPresentBeforeTrade'>
                {selectedStock?.planId ?
                    selectedStock?.trade ?
                        <TradePresent selectedStock={selectedStock} /> :
                        <PreTradePlanPresent selectedStock={selectedStock} />
                    : <div>
                        <p>No plan set for this ticker</p>
                        <div>
                            <button onClick={() => dispatch(setStockDetailState(5))}>Ticker To Plan</button>
                        </div>
                    </div>}
            </div>
        </div>
    )
}

export default EnterExitTradeGraph