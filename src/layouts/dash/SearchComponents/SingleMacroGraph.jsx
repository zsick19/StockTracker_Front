import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectMacroTickers } from '../../../features/Engine/EnginePlanApiSlice'
import TodayOnlyChartWrapper from '../../../components/ChartSubGraph/TodayOnlyChart/TodayOnlyChartWrapper'

function SingleMacroGraph({ ticker })
{
    const macroResult = useSelector((state) => selectMacroTickers(state, ticker))
    const [showMinOrDaily, setShowMinOrDaily] = useState(true)
    console.log(macroResult)

    return (
        <div className='SingleMacroGraphArray' onContextMenu={(e) => { e.preventDefault(); setShowMinOrDaily(prev => !prev) }}>

            {showMinOrDaily ?
                <TodayOnlyChartWrapper ticker={macroResult.id}
                    candleData={macroResult.todaysCandles}
                    mostRecentPrice={macroResult.mostRecentPrice}
                    planData={macroResult.planData}
                    snapShot={macroResult.snapShot}
                />
                : <div>
                    fetch daily chart here
                </div>}
            <div>
                <p>{macroResult.id}</p>
            </div>
        </div>
    )
}

export default SingleMacroGraph