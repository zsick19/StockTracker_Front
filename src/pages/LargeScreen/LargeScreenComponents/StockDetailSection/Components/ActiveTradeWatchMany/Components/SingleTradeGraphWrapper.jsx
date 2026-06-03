import React, { useMemo, useState } from 'react'
import { activeTradeWithGraphSelectors, useGetUsersActiveTradesWithGraphQuery } from '../../../../../../../features/Trades/TradeSliceApi'
import JustMACDSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/JustMACDSubChart'
import * as short from 'short-uuid'
import ChartWithNoFetchWrapper from '../../../../../../../components/ChartSubGraph/ChartWithNoFetchingWrapper'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import TradeActionInfo from './TradeActionInfo'

function SingleTradeGraphWrapper({ id })
{
    const { trade } = useGetUsersActiveTradesWithGraphQuery(undefined, { selectFromResult: ({ data }) => ({ trade: data ? activeTradeWithGraphSelectors.selectById(data, id) : undefined }) })
    const uuid = useMemo(() => short.generate(), [])
    const [showMACD, setShowMACD] = useState(false)

    return (
        <div className='SingleTradeWithGraphWrapper'>
            <div>{trade.tickerSymbol}</div>
            <ChartWithNoFetchWrapper ticker={trade.tickerSymbol}
                interactionController={{ isZoomAble: true, isInteractive: false, isLivePrice: false }} candleData={{ candleData: trade.dailyCandles }}
                uuid={uuid} chartId={trade._id}
                timeFrame={defaultTimeFrames.oneDayOneMin}
                dailyCalculatedValues={{ PrevDailyBar: trade.PrevDailyBar, TodayOpenPrice: trade.TodayOpenPrice, ATR: trade.atr, dailyEMA: trade.dailyEma }}
                lastCandleData={trade.mostRecentTickerCandle}
                showEMAs={true}
                tradingPlanPrices={trade.tradingPlanPrices}
                liveActionTimeFrame={true}
            />
            {showMACD ?
                <JustMACDSubChart liveActionTimeFrame={true} candleData={trade.dailyCandles} uuid={uuid} timeFrame={defaultTimeFrames.oneDayOneMin} setShowMACD={setShowMACD} />
                : <TradeActionInfo percentGain={trade.percentFromOpen.toFixed(2)} ticker={trade.tickerSymbol}
                    todayAtr={trade.todaysATRCapture.toFixed(2)} atr={trade.atr} mostRecentPrice={trade.mostRecentPrice.toFixed(2)} setShowMACD={setShowMACD} />
            }
        </div>
    )
}

export default SingleTradeGraphWrapper