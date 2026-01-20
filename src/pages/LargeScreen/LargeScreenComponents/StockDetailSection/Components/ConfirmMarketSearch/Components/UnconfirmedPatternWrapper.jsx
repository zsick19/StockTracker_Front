import React, { useEffect, useState } from 'react'
import SingleUnconfirmedResultBlock from './SingleUnconfirmedResultBlock'

function UnconfirmedPatternWrapper({ unconfirmedPatterns, currentPage, keepTheseTickers, setKeepTheseTickers })
{
    const patternsPerPage = 4
    const [currentPageTickers, setCurrentPageTickers] = useState(unconfirmedPatterns.slice((currentPage - 1) * patternsPerPage, patternsPerPage))

    useEffect(() =>
    {
        setCurrentPageTickers(unconfirmedPatterns.slice((currentPage - 1) * patternsPerPage, patternsPerPage * currentPage))
    }, [currentPage])

    return (
        <div id='UnconfirmedPatternTickerResults'>
            {currentPageTickers.map((ticker) => <SingleUnconfirmedResultBlock ticker={ticker} keepTheseTickers={keepTheseTickers} setKeepTheseTickers={setKeepTheseTickers} />)}
        </div>
    )
}

export default UnconfirmedPatternWrapper