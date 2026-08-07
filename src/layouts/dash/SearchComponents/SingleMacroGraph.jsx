import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectMacroTickers } from '../../../features/Engine/EnginePlanApiSlice'
import TodayOnlyChartWrapper from '../../../components/ChartSubGraph/TodayOnlyChart/TodayOnlyChartWrapper'
import { setStockDetailStateWithTicker } from '../../../features/SelectedStocks/StockDetailControlSlice'

function SingleMacroGraph({ ticker, handleNavigateClear })
{
    const macroResult = useSelector((state) => selectMacroTickers(state, ticker))
    const [showMinOrDaily, setShowMinOrDaily] = useState(true)
    const dispatch = useDispatch()

    return (
        <div className='SingleMacroGraphArray' onDoubleClick={() => { dispatch(setStockDetailStateWithTicker({ detail: 19, ticker })); handleNavigateClear() }} onContextMenu={(e) => { e.preventDefault(); setShowMinOrDaily(prev => !prev) }}>

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