import { useDispatch, useSelector } from 'react-redux'
import { selectTradeChartStock } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import TradePresent from './Components/TradePresent'
import PreTradePlanPresent from './Components/PreTradePlanPresent'
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import './EnterExitTradeGraph.css'
import TradeGraphChartWrapper from './Components/TradeGraphChartWrapper'
import { useEffect, useMemo, useState } from 'react'
import { defaultTimeFrames } from '../../../../../../Utilities/TimeFrames'
import * as short from 'short-uuid'
import { clearGraphControl, setInitialGraphControl } from '../../../../../../features/Charting/GraphHoverZoomElement'
import ChartMenuBar from '../../../../../../components/ChartSubGraph/ChartMenuBar'
import { clearGraphHoursControl, setInitialGraphHoursControl } from '../../../../../../features/Charting/GraphMarketHourElement'
import { clearGraphStudyControl, setInitialGraphStudyControl } from '../../../../../../features/Charting/GraphStudiesVisualElement'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../../../../../features/Charting/GraphToSubGraphCrossHairElement'
import { clearGraphVisibility, setInitialGraphVisibility } from '../../../../../../features/Charting/ChartingVisibility'
import FourWayGraphWrapper from './SupportGraphComponents/FourWayGraphWrapper'

function EnterExitTradeGraph()
{
    const dispatch = useDispatch()

    const selectedStock = useSelector(selectTradeChartStock)
    const [timeFrame, setTimeFrame] = useState(selectedStock?.timeFrame || defaultTimeFrames.threeDayOneMin)
    const uuid = useMemo(() => short.generate(), [])

    useEffect(() =>
    {

        dispatch(setInitialGraphControl({ uuid }))
        dispatch(setInitialGraphStudyControl({ uuid }))
        dispatch(setInitialGraphToSubGraphCrossHair({ uuid }))
        dispatch(setInitialGraphHoursControl({ uuid }))
        dispatch(setInitialGraphVisibility({ uuid }))

        return (() =>
        {
            if (uuid) 
            {
                dispatch(clearGraphControl({ uuid }))
                dispatch(clearGraphStudyControl({ uuid }))
                dispatch(clearGraphToSubGraphCrossHair({ uuid }))
                dispatch(clearGraphHoursControl({ uuid }))
                dispatch(clearGraphVisibility({ uuid }))
            }
        })
    }, [])
    const [showEMAs, setShowEMAs] = useState(false)
    const [subCharts, setSubCharts] = useState([])

    const [showSupportingTickers, setShowSupportingTickers] = useState(false)

    return (
        <div id='LHS-TradeRecord'>
            {showSupportingTickers ? <FourWayGraphWrapper selectedStock={selectedStock} /> :
                <>
                    <ChartMenuBar ticker={selectedStock?.tickerSymbol} setTimeFrame={setTimeFrame} subCharts={subCharts} setSubCharts={setSubCharts} timeFrame={timeFrame} uuid={uuid} setShowEMAs={setShowEMAs} />
                    {selectedStock ? <TradeGraphChartWrapper selectedStock={selectedStock} subCharts={subCharts} uuid={uuid} timeFrame={timeFrame} setTimeFrame={setTimeFrame} showEMAs={showEMAs} /> : <div></div>}
                </>
            }

            <div id='LHS-PlanPresentBeforeTrade'>
                {selectedStock?.planId ?
                    selectedStock?.trade ? 
                    <TradePresent selectedStock={selectedStock} setShowSupportingTickers={setShowSupportingTickers} /> :
                        <PreTradePlanPresent selectedStock={selectedStock} setShowSupportingTickers={setShowSupportingTickers} />
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