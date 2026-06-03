import React from 'react'
import { useSelector } from 'react-redux'
import { selectTradeChartStock } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { useGetStockDataUsingStartDateAndTimeFrameQuery, useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../../Utilities/TimeFrames'
import VolDistChart from './VolDistChart'
import OpenRangeDistChart from './OpenRangeDistChart'
import { subBusinessDays } from 'date-fns'
import OpenCloseExtremeProbability from './OpenCloseExtremeProbability'

function VolDistributionCheck({ ticker, relevantStartDate })
{
  const plannedTicker = useSelector(state => selectTradeChartStock(state))
  let startDate = plannedTicker.plan?.relevantCandleDate || subBusinessDays(new Date(), 5)

  const { data, isSuccess, isLoading, isError, error } = useGetStockDataUsingStartDateAndTimeFrameQuery({
    ticker, timeFrame: defaultTimeFrames.threeDayFiveMin,
    start: new Date(startDate).toISOString()
  })

  let volDistributionContent
  let highLowDistributionContent
  let probabilityContent
  if (isSuccess)
  {
    volDistributionContent = <VolDistChart candleData={data.candleData} />
    highLowDistributionContent = <OpenRangeDistChart candleData={data.candleData} />
    probabilityContent = <OpenCloseExtremeProbability candleData={data.candleData} />
  }
  else if (isLoading)
  {
    volDistributionContent = <div>Loading...</div>
    highLowDistributionContent = <div>Loading...</div>
    probabilityContent = <div>Loading...</div>
  }
  else if (isError)
  {
    console.log(error)
  }

  return (
    <div>
      <div className='flex'>
        <p>{ticker} </p>
        <p>Relevant Start Date: {new Date(startDate).toLocaleDateString()}</p>
      </div>
      <div className='flex'>
        <div>d4</div>
        <div>d3</div>
        <div>d2</div>
        <div>d1</div>
        <div>Today</div>
        {probabilityContent}
      </div>
      <div className='flex'>

        {volDistributionContent}
        {highLowDistributionContent}
      </div>
    </div>
  )
}

export default VolDistributionCheck