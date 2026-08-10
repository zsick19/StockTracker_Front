import React from 'react'
import HistoricalIntraDayChart from '../../../../../../../components/ChartSubGraph/HistoricalIntraDayChart/HistoricalIntraDayChart'

function PreviousWeekGraphWrapper({ candleData, reviewedTrade, startDate, timeFrame })
{
    let EntryTimestamp = reviewedTrade.enteredTimestamp
    let LLTimestamp = reviewedTrade.lowestLowTimestamp
    let HHTimestamp = reviewedTrade.highestHighTimestamp

    console.log(reviewedTrade)

    return (
        <div>
            <HistoricalIntraDayChart candleData={candleData}
                tradePriceTargets={reviewedTrade.priceTargets} extremes={{ low: reviewedTrade.lowestLowSeen, high: reviewedTrade.highestHighSeen }}
                tradedTimeStamps={{ EntryTimestamp, LLTimestamp, HHTimestamp }} timeFrame={timeFrame} />
        </div>
    )
}

export default PreviousWeekGraphWrapper