import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearGraphControl, setInitialGraphControl } from '../../features/Charting/GraphHoverZoomElement'
import { clearGraphHoursControl, setInitialGraphHoursControl } from '../../features/Charting/GraphMarketHourElement'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../features/Charting/GraphToSubGraphCrossHairElement'
import DailyChartWithStartToToday from './DailyChartWithStartToToday'

function DailyChartWrapper({ ticker, candleData, uuid, chartStartDate, chartEndDate, pricePoints, currentDiscount, discountPrices })
{

    const dispatch = useDispatch()

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
        <DailyChartWithStartToToday ticker={ticker} candleData={candleData}
            uuid={uuid} chartStartDate={chartStartDate} isZoomAble={true} pricePoints={pricePoints}
            currentDiscount={currentDiscount} discountPrices={discountPrices}
        />
    )
}

export default DailyChartWrapper