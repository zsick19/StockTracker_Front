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
import ChartMenuBar from '../../../../../../components/ChartSubGraph/ChartMenuBar'

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
    const [showEMAs, setShowEMAs] = useState(false)
    const [subCharts, setSubCharts] = useState([])
    
    return (
        <div id='LHS-TradeRecord'>
            <ChartMenuBar ticker={selectedStock?.tickerSymbol} setTimeFrame={setTimeFrame} subCharts={subCharts} setSubCharts={setSubCharts} timeFrame={timeFrame} uuid={uuid} setShowEMAs={setShowEMAs} />

            {selectedStock ? <TradeGraphChartWrapper selectedStock={selectedStock} subCharts={subCharts} uuid={uuid} timeFrame={timeFrame} setTimeFrame={setTimeFrame} showEMAs={showEMAs} /> : <div></div>}

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