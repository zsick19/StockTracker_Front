import React from 'react'
import { useFetchNewsRunnerTradeQuotesQuery } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'
import QuoteVisual from './QuoteVisual'
import TradesVisual from './TradesVisual'
import { isWeekend } from 'date-fns'
import NewsDetail from './NewsDetail'

function TradeAndQuoteWrapper({ tickerForStream })
{
  const pollingInterval = isWeekend(new Date()) ? 0 : 5000
  const { data, isLoading, isSuccess, isError, error, refetch } = useFetchNewsRunnerTradeQuotesQuery({ tickerSymbol: tickerForStream }, { pollingInterval })


  let quoteContent
  let tradeContent
  let currentStatus
  if (isSuccess)
  {
    quoteContent = <QuoteVisual quotes={data.quotes} ticker={tickerForStream} />
    tradeContent = <TradesVisual trades={data.trades} ticker={tickerForStream} />
    currentStatus = <div>processing and displaying hold/sell signals</div>
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
    <div id='QuoteTradeArticleContainer'>
      <div className='flex'>
        <NewsDetail tickerSymbol={tickerForStream} />
        {currentStatus}
      </div>
      <div id='QuoteAndTradeContainer'>
        {quoteContent}
        {tradeContent}
      </div>
    </div>
  )
}

export default TradeAndQuoteWrapper