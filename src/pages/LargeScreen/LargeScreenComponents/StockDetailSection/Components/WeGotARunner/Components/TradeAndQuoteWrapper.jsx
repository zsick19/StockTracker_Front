import React from 'react'
import { useFetchNewsRunnerTradeQuotesQuery } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'
import QuoteVisual from './QuoteVisual'
import TradesVisual from './TradesVisual'
import { isWeekend } from 'date-fns'

function TradeAndQuoteWrapper({ tickerForStream })
{
  const pollingInterval = isWeekend(new Date()) ? 0 : 5000
  const { data, isLoading, isSuccess, isError, error, refetch } = useFetchNewsRunnerTradeQuotesQuery({ tickerSymbol: tickerForStream }, { pollingInterval })


  let quoteContent
  let tradeContent
  if (isSuccess)
  {
    quoteContent = <QuoteVisual quotes={data.quotes} ticker={tickerForStream} />
    tradeContent = <TradesVisual trades={data.trades} ticker={tickerForStream} />
  } else if (isLoading)
  {
    quoteContent = <div>Loading...</div>
    tradeContent = <div>Loading...</div>
  } else if (isError)
  {
    quoteContent = <div>Error</div>
    tradeContent = <div>Error</div>
  }


  return (
    <div id='QuoteAndTradeContainer'>
      {quoteContent}
      {tradeContent}
    </div>
  )
}

export default TradeAndQuoteWrapper