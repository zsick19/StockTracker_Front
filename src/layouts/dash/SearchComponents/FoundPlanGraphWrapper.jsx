import React from 'react'
import { useSelector } from 'react-redux';
import { selectTodaysCandlesByTicker } from '../../../features/Engine/EnginePlanApiSlice';
import TodaysMarketOnlyChart from '../../../components/ChartSubGraph/TodayOnlyChart/TodaysMarketOnlyChart';

function FoundPlanGraphWrapper({ tickerSymbol, foundPlan })
{
    console.log(foundPlan.planConfig)
    const plannedTickerCandles = useSelector(state => selectTodaysCandlesByTicker(state, tickerSymbol))

    return (
        <div className='SingleMacroGraphArray' onContextMenu={(e) => { e.preventDefault(); setShowMinOrDaily(prev => !prev) }}>

            {/* <TodayOnlyChartWrapper ticker={tickerSymbol}
                candleData={plannedTicker.todaysCandles}

                planData={macroResult.planData}

                zoneData={macroResult.planData.dailyZone}
                dailyEM={macroResult.planData.dailyEM}
                weeklyEM={macroResult.planData.weeklyEM}
                snapShotInfo={macroResult.snapShot}

                isZoomAble={true}
            /> */}
            <TodaysMarketOnlyChart ticker={tickerSymbol} candleData={plannedTickerCandles} isZoomAble={true}
                // uuid={uuid}
                // zoneData={zoneData} dailyEM={dailyEM} weeklyEM={weeklyEM} snapShotInfo={snapShotInfo} 
                isOnlyYZoomAble={true} />

        </div>
    )
}

export default FoundPlanGraphWrapper