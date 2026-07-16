import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearGraphControl, setInitialGraphControl } from '../../features/Charting/GraphHoverZoomElement'
import { clearGraphStudyControl, setGraphVolumeControl, setInitialGraphStudyControl } from '../../features/Charting/GraphStudiesVisualElement'
import { clearGraphHoursControl, setInitialGraphHoursControl } from '../../features/Charting/GraphMarketHourElement'
import { clearGraphVisibility, setIndividualAnyVisibility, setInitialGraphVisibility } from '../../features/Charting/ChartingVisibility'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../features/Charting/GraphToSubGraphCrossHairElement'
import ChartGraph from './ChartGraph'
import BackTestingChart from './BackTestingChart'

function BackTestChartWrapper({ ticker, candleData, uuid, chartStartDate, chartEndDate, pricePoints })
{

    const dispatch = useDispatch()

    useEffect(() =>
    {
        if (uuid)
        {
            dispatch(setInitialGraphControl({ uuid }))
            dispatch(setInitialGraphToSubGraphCrossHair({ uuid }))
            dispatch(setInitialGraphHoursControl({ uuid }))
        }


        return (() =>
        {
            if (uuid)
            {
                dispatch(clearGraphControl({ uuid }))
                dispatch(clearGraphToSubGraphCrossHair({ uuid }))
                dispatch(clearGraphHoursControl({ uuid }))
            }
        })
    }, [])

    return (
        <div className="BackTestChartWrapper">
            <BackTestingChart ticker={ticker}
                candleData={candleData}
                chartStartDate={chartStartDate}
                chartEndDate={chartEndDate}
                uuid={uuid}
                isZoomAble={true}
                pricePoints={pricePoints}
            />
        </div>)
}

export default BackTestChartWrapper