import React, { useState } from 'react'
import SingleUnconfirmedResultBlock from './SingleUnconfirmedResultBlock'

function UnconfirmedPatternWrapper({ unconfirmedPatterns, currentPage, keepTheseTickers, setKeepTheseTickers })
{
    const patternsPerPage = 4
    const [currentPageTickers, setCurrentPageTickers] = useState(unconfirmedPatterns.slice((currentPage - 1) * patternsPerPage, patternsPerPage))

    let tickerSearchResult = currentPageTickers.map((ticker) => <SingleUnconfirmedResultBlock ticker={ticker} keepTheseTickers={keepTheseTickers} setKeepTheseTickers={setKeepTheseTickers} />)



    return (
        <div id='UnconfirmedPatternTickerResults'>
            {tickerSearchResult}
        </div>
    )
}

export default UnconfirmedPatternWrapper