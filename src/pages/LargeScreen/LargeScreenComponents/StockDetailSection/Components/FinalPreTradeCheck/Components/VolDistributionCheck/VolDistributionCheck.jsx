import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectTradeChartStock } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { useGetStockDataUsingStartDateAndTimeFrameQuery, useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../../Utilities/TimeFrames'
import VolDistChart from './VolDistChart'
import OpenRangeDistChart from './OpenRangeDistChart'
import { subBusinessDays } from 'date-fns'
import OpenCloseExtremeProbability from './OpenCloseExtremeProbability'
import ChartWithChartingWrapper from '../../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import * as short from 'short-uuid'
import VolEfficiencyChartDataWrapper from './VolEfficiencyChartDataWrapper'
import './VolDistributionCheck.css'

function VolDistributionCheck({ plannedTicker, activeTrade, setTradeDetails })
{
  const uuid = useMemo(() => short.generate(), [])
  let ticker = plannedTicker?.tickerSymbol || plannedTicker.ticker
  let startDate = plannedTicker.plan?.relevantCandleDate || subBusinessDays(new Date(), 20).toISOString()

  console.log(plannedTicker.plan)
  console.log(activeTrade)

  const { data, isSuccess, isLoading, isFetching, isError, error } = useGetStockDataUsingStartDateAndTimeFrameQuery({ ticker, timeFrame: defaultTimeFrames.threeDayFiveMin, start: startDate.split('T')[0] })

  let volDistributionContent
  let highLowDistributionContent
  let probabilityContent
  let volumeEfficiencyContent
  if (isSuccess)
  {
    volumeEfficiencyContent = <VolEfficiencyChartDataWrapper timeFrame={defaultTimeFrames.threeDayFiveMin} ticker={ticker} candleData={data.candleData} chartId={plannedTicker._id} uuid={uuid} />
    volDistributionContent = <VolDistChart candleData={data.candleData} />
    highLowDistributionContent = <OpenRangeDistChart candleData={data.candleData} />
    probabilityContent = <OpenCloseExtremeProbability candleData={data.candleData} setTradeDetails={setTradeDetails} />
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
    <div id='VolDistVisual'>
      <div className='flex'>
        <p>{ticker}</p>
        <p>Relevant Start Date: {new Date(startDate).toLocaleDateString()}</p>
      </div>

      {volumeEfficiencyContent}

      <div className='flex'>
        {volDistributionContent}
        {highLowDistributionContent}
        {probabilityContent}
      </div>
      
    </div>
  )
}

export default VolDistributionCheck