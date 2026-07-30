import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { clearGraphHoursControl, setInitialGraphHoursControl } from '../../../features/Charting/GraphMarketHourElement'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../../features/Charting/GraphToSubGraphCrossHairElement'

import DailyRSISubChart from './SubCharts/DailyRSISubChart'
import DailyChartWithStartToToday from '../DailyChartWithStartToToday'
import { clearGraphStudyControl, setInitialGraphStudyControl } from '../../../features/Charting/GraphStudiesVisualElement'
import { clearGraphControl, setInitialGraphControl } from '../../../features/Charting/GraphHoverZoomElement'

function DailyChartWithRSIWrapper({ ticker, candleData, uuid, chartStartDate, chartEndDate, pricePoints, currentDiscount, discountPrices, exitAlertPrice })
{

    const dispatch = useDispatch()
    const [chartZoomState, setChartZoomState] = useState({ x: undefined, y: undefined })


    useEffect(() =>
    {
        if (uuid)
        {
            dispatch(setInitialGraphControl({ uuid }))
            
            dispatch(setInitialGraphToSubGraphCrossHair({ uuid }))
            dispatch(setInitialGraphHoursControl({ uuid }))
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
            <DailyChartWithStartToToday ticker={ticker} candleData={candleData} chartZoomState={chartZoomState}
                setChartZoomState={setChartZoomState}
                uuid={uuid} chartStartDate={chartStartDate} isZoomAble={true} pricePoints={pricePoints}
                currentDiscount={currentDiscount} discountPrices={discountPrices} exitAlertPrice={exitAlertPrice}
            />
            <DailyRSISubChart candleData={candleData} uuid={uuid}
                chartStartDate={chartStartDate} chartZoomState={chartZoomState}
            />
        </>
    )
}

export default DailyChartWithRSIWrapper