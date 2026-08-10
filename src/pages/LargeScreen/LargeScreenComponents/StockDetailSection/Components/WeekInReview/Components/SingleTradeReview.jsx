import React from 'react'
import { useGetStockDataUsingStartDateAndTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import { startOfDay, subBusinessDays } from 'date-fns'
import PreviousWeekGraphWrapper from './PreviousWeekGraphWrapper'

function SingleTradeReview({ reviewedTrade, setReviewedTrade })
{
    let ticker = reviewedTrade.tickerSymbol
    let start = startOfDay(subBusinessDays(new Date(), 10))
    let timeFrame = defaultTimeFrames.threeDayFiveMin

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingStartDateAndTimeFrameQuery({ ticker: reviewedTrade.tickerSymbol, timeFrame: defaultTimeFrames.threeDayFiveMin, start })

    let graphContent
    if (isSuccess)
    {
        graphContent = <PreviousWeekGraphWrapper candleData={data.candleData} reviewedTrade={reviewedTrade} 
        
        startDate={start} timeFrame={timeFrame} />
    } else if (isLoading)
    {
        graphContent = <div>Loading...</div>
    } else if (isError)
    {
        graphContent = <div>Error fetching candles</div>
    }
    return (
        <div id='selectPreviousTrade'>
            {graphContent}
            <div>
                <h2>{ticker}</h2>
                <p>Plan Info Here</p>
                <button onClick={() => setReviewedTrade(undefined)}>Clear</button>
            </div>
        </div>
    )
}

export default SingleTradeReview