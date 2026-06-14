import React, { useMemo, useState } from 'react'
import { activeTradeWithGraphSelectors, useGetUsersActiveTradesWithGraphQuery } from '../../../../../../../features/Trades/TradeSliceApi'
import JustMACDSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/JustMACDSubChart'
import * as short from 'short-uuid'
import ChartWithNoFetchWrapper from '../../../../../../../components/ChartSubGraph/ChartWithNoFetchingWrapper'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import TradeActionInfo from './TradeActionInfo'
import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { provideEnterExitPlanSelector } from '../../../../../../../Utilities/adaptorSelection'
import VolumeStatus from './VolumeStatus'
import { differenceInMinutes, startOfDay } from 'date-fns'
function SingleTradeGraphWrapper({ id })
{
    const uuid = useMemo(() => short.generate(), [])
    const [showMACD, setShowMACD] = useState(false)

    const { tradeWGraph } = useGetUsersActiveTradesWithGraphQuery(undefined, { selectFromResult: ({ data }) => ({ tradeWGraph: data ? activeTradeWithGraphSelectors.selectById(data, id) : undefined }) })
    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideEnterExitPlanSelector(data, id) : undefined }) })

    return (
        <div className='SingleTradeWithGraphWrapper'>
            <div>{tradeWGraph.tickerSymbol}</div>
            <ChartWithNoFetchWrapper
                ticker={tradeWGraph.tickerSymbol}
                interactionController={{ isZoomAble: true, isInteractive: false, isLivePrice: false }}
                candleData={{ candleData: tradeWGraph.dailyCandles }}
                uuid={uuid} chartId={tradeWGraph._id}
                timeFrame={defaultTimeFrames.oneDayOneMin}
                lastCandleData={tradeWGraph.mostRecentTickerCandle}
                showEMAs={true}
                tradingPlanPrices={tradeWGraph.tradingPlanPrices}
                liveActionTimeFrame={true}
                planChartingData={plan}
                dailyCalculatedValues={{
                    PrevDailyBar: tradeWGraph.PrevDailyBar,
                    TodayOpenPrice: tradeWGraph.TodayOpenPrice,
                    ATR: plan?.dailyTickerValues.atr,
                    dailyEMA: plan?.dailyTickerValues.dailyEma
                }}
                morningMetrics={plan?.morningMetrics}
            />
            <div>
                {tradeWGraph.mostRecentTickerCandle.ClosePrice > tradeWGraph.TodayOpenPrice ?
                    <p>{(tradeWGraph.totalVolumeFirstHour * 100 / plan.morningVolumeMetrics.avgUpTotalVolToFirstHour).toFixed()}% Up Morning</p>
                    : <p>{(tradeWGraph.totalVolumeFirstHour * 100 / plan.morningVolumeMetrics.avgDownTotalVolToFirstHour).toFixed()}% Down Morning</p>
                }
            </div>
            {showMACD ?
                <JustMACDSubChart liveActionTimeFrame={true} candleData={tradeWGraph.dailyCandles} uuid={uuid} timeFrame={defaultTimeFrames.oneDayOneMin} setShowMACD={setShowMACD} />
                : <TradeActionInfo
                    ticker={plan.tickerSymbol}
                    extentProb={plan.extentProb}
                    atr={plan.dailyTickerValues.atr}
                    morningMetrics={plan.morningMetrics}
                    percentGain={tradeWGraph.percentFromOpen.toFixed(2)}
                    todayAtr={tradeWGraph.todaysATRCapture.toFixed(2)}
                    mostRecentPrice={tradeWGraph.mostRecentPrice.toFixed(2)}
                    setShowMACD={setShowMACD}
                />

            }
            <VolumeStatus currentNyTime={differenceInMinutes(new Date(), startOfDay())}
                liveCandles5Min={tradeWGraph.fiveMinVolume}
                livePreMarket30Min={tradeWGraph.preMarketVolume}
                historicalMetrics={plan.morningVolumeMetrics}
            />
        </div>
    )
}

export default SingleTradeGraphWrapper