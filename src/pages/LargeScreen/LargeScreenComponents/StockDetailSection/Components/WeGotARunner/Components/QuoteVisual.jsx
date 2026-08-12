import React from 'react'
import { useSelector } from 'react-redux'
import { selectNewRunnerQuotesById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import BidAskSpreadChart from '../../DeepDiscountTradeView/Components/BidAskSpreadChart'
import { RunnerSpreadChart } from './RunnerSpreadChart'

function QuoteVisual({ quotes, ticker })
{
    const mostRecentQuote = useSelector((state) => selectNewRunnerQuotesById(state, ticker))
    // const mostRecentQuote
    return (
        <div>
            {/* <div className='flex'>
                <p>{mostRecentQuote.BidPrice}</p>
                <p>{mostRecentQuote.BidSize}</p>
                <p>{mostRecentQuote.AskPrice}</p>
                <p>{mostRecentQuote.AskSize}</p>
            </div> */}

            <RunnerSpreadChart tickerSymbol={ticker} currentSpread={mostRecentQuote} rawQuoteHistory={quotes} />
        </div>
    )
}

export default QuoteVisual