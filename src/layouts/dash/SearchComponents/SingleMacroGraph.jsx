import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectMacroTickers } from '../../../features/Engine/EnginePlanApiSlice'
import TodayOnlyChartWrapper from '../../../components/ChartSubGraph/TodayOnlyChart/TodayOnlyChartWrapper'

function SingleMacroGraph({ ticker })
{
    const macroResult = useSelector((state) => selectMacroTickers(state, ticker))
    const [showMinOrDaily, setShowMinOrDaily] = useState(true)


    return (
        <div className='SingleMacroGraphArray' onContextMenu={(e) => { e.preventDefault(); setShowMinOrDaily(prev => !prev) }}>

            {showMinOrDaily ?
                <TodayOnlyChartWrapper ticker={macroResult.id}
                    candleData={macroResult.todaysCandles}
                    mostRecentPrice={macroResult.mostRecentPrice}
                    planData={macroResult.planData}
                    snapShot={macroResult.snapShot}

                    zoneData={macroResult.planData.dailyZone}
                    dailyEM={macroResult.planData.dailyEM}
                    weeklyEM={macroResult.planData.weeklyEM}
                    snapShotInfo={macroResult.snapShot}

                    isZoomAble={true}
                />
                : <div>
                    fetch daily chart here
                </div>}
            <div>
                <p
                    style={{
                        backgroundColor: ` ${macroResult.mostRecentPrice > macroResult.snapShot.DailyBar.OpenPrice ? 'green' :
                            macroResult.mostRecentPrice === macroResult.snapShot.DailyBar.OpenPrice ? 'gray' :
                                'red'}`,
                        borderRadius: '0px 0px 10px 10px'
                    }}
                >{macroResult.id}</p>
            </div>
        </div>
    )
}

export default SingleMacroGraph