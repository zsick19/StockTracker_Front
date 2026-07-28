import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearGraphControl, setInitialGraphControl } from '../../features/Charting/GraphHoverZoomElement'
import { clearGraphStudyControl, setGraphVolumeControl, setInitialGraphStudyControl } from '../../features/Charting/GraphStudiesVisualElement'
import { clearGraphHoursControl, setInitialGraphHoursControl } from '../../features/Charting/GraphMarketHourElement'
import { clearGraphVisibility, setIndividualAnyVisibility, setInitialGraphVisibility } from '../../features/Charting/ChartingVisibility'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../features/Charting/GraphToSubGraphCrossHairElement'
import ChartGraph from './ChartGraph'

function IntegratedNoFetchChartWrapper({ ticker, candleData, uuid, mostRecentPrice, timeFrame, dailyCalculatedValues, morningMetrics })
{

    const dispatch = useDispatch()

    useEffect(() =>
    {
        if (uuid)
        {
            dispatch(setInitialGraphControl({ uuid }))
            dispatch(setInitialGraphStudyControl({ uuid }))
            dispatch(setInitialGraphToSubGraphCrossHair({ uuid }))
            dispatch(setInitialGraphHoursControl({ uuid }))
            dispatch(setInitialGraphVisibility({ uuid }))
        }


        return (() =>
        {
            if (uuid)
            {
                dispatch(clearGraphControl({ uuid }))
                dispatch(setInitialGraphStudyControl({ uuid }))
                dispatch(clearGraphToSubGraphCrossHair({ uuid }))
                dispatch(clearGraphHoursControl({ uuid }))
                dispatch(clearGraphVisibility({ uuid }))
            }
        })
    }, [])

    const [showEMA, setShowEMA] = useState(false)

    return (
        <div className="IntegratedChartWrapper">
            <div className='IntegratedChartShowHideButtons' >
                <button onClick={() => dispatch(setIndividualAnyVisibility({ uuid: uuid, chartingElement: 'morningMetricsVisuals' }))}>MM</button>
                <button onClick={() => dispatch(setIndividualAnyVisibility({ uuid: uuid, chartingElement: 'patternVisuals' }))}>Pattern</button>
                <button onClick={() => dispatch(setIndividualAnyVisibility({ uuid: uuid, chartingElement: 'calculatedPriceLevels' }))} >PL</button>
                <button onClick={() => dispatch(setGraphVolumeControl({ uuid: uuid }))}>Volume</button>

                <button disabled onClick={() => dispatch(setIndividualAnyVisibility({ uuid: uuid, chartingElement: 'calculatedPriceLevels' }))} >Today</button>
                <button disabled onClick={() => dispatch(setIndividualAnyVisibility({ uuid: uuid, chartingElement: 'calculatedPriceLevels' }))} >Yesterday</button>

                <button onClick={() => setShowEMA(prev => !prev)}>EMA</button>
            </div>
            <ChartGraph ticker={ticker}
                candleData={candleData}
                uuid={uuid}
                mostRecentPrice={{ Price: mostRecentPrice }}
                // lastCandleData={{ ClosePrice: mostRecentPrice }}
                isInteractive={false}
                isZoomAble={true}
                isLivePrice={true}

                timeFrame={timeFrame}

                dailyCalculatedValues={dailyCalculatedValues}
                morningMetrics={morningMetrics}

                showEMAs={showEMA}

            // chartId={chartId}
            // lastCandleData={lastCandleData}


            // EMNumbers={EMNumbers}
            // tradingPlanPrices={tradingPlanPrices}
            // liveActionTimeFrame={liveActionTimeFrame}

            />
        </div>)
}

export default IntegratedNoFetchChartWrapper