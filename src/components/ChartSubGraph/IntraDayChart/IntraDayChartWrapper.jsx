import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearGraphControl, setInitialGraphControl } from '../../../features/Charting/GraphHoverZoomElement'
import { clearGraphHoursControl, setInitialGraphHoursControl, setInitialGraphHoursControlForIntraDay } from '../../../features/Charting/GraphMarketHourElement'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../../features/Charting/GraphToSubGraphCrossHairElement'
import DailyChartWithStartToToday from '../DailyChartWithStartToToday'
import { filterRegularMarketHours } from '../../../Utilities/TimeFrames'
import IntraDayChartWithStartToToday from './IntraDayChartWithStartToToday'
import MACDSubChart from '../SubCharts/MACDSubChart'
import IntraDayMACDSubChart from './SubCharts/IntraDayMACDSubChart'

function IntraDayChartWrapper({ ticker, candleData, uuid, timeFrame,
    chartStartDate, chartEndDate, pricePoints, currentDiscount, discountPrices, exitAlertPrice })
{
    const dispatch = useDispatch()

    //filter out pre and post market candles
    const cleanCandleData = filterRegularMarketHours(candleData)
    const [chartZoomState, setChartZoomState] = useState({ x: undefined, y: undefined })
    // const [currentCrossHairX, setCurrentCrossHairX] = useState(undefined)

    useEffect(() =>
    {
        if (uuid)
        {
            dispatch(setInitialGraphControl({ uuid }))
            dispatch(setInitialGraphToSubGraphCrossHair({ uuid }))
            dispatch(setInitialGraphHoursControlForIntraDay({ uuid }))
            // dispatch(setInitialGraphVisibility({ uuid }))
        }

        return (() =>
        {
            if (uuid)
            {
                dispatch(clearGraphControl({ uuid }))
                dispatch(clearGraphToSubGraphCrossHair({ uuid }))
                dispatch(clearGraphHoursControl({ uuid }))
                // dispatch(clearGraphVisibility({ uuid }))
            }
        })
    }, [])

    return (
        <>
            <IntraDayChartWithStartToToday ticker={ticker} candleData={cleanCandleData}
                chartZoomState={chartZoomState} setChartZoomState={setChartZoomState}
                uuid={uuid} chartStartDate={chartStartDate} isZoomAble={true} pricePoints={pricePoints}
            // setCurrentCrossHairX={setCurrentCrossHairX}
            // currentDiscount={currentDiscount} discountPrices={discountPrices} exitAlertPrice={exitAlertPrice}
            />

            <IntraDayMACDSubChart candleData={cleanCandleData} chartStartDate={chartStartDate} hideTimeLine={true}
                // currentCrossHairX={currentCrossHairX}
                uuid={uuid} timeFrame={timeFrame} chartZoomState={chartZoomState} setChartZoomState={setChartZoomState} />
        </>
    )
}

export default IntraDayChartWrapper



