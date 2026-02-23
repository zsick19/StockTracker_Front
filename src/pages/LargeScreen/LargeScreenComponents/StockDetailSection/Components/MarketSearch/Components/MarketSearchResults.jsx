import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectUsersPatternedHistory } from '../../../../../../../features/Initializations/InitializationSliceApi'
import SingleSearchResultBlock from './SingleSearchResultBlock'

function MarketSearchResults({ searchResults })
{
    const memoizedUserPatterns = useMemo(() => selectUsersPatternedHistory(), [])
    const patterns = useSelector(memoizedUserPatterns)
    console.log(patterns)

    return (
        <div id='LHS-MarketSearchResultBlocks'>
            {patterns ? searchResults.map((search, index) =>
            {
                return <SingleSearchResultBlock key={`marketSearchBlock${search.Symbol}`}
                    index={index} search={search} found={patterns.includes(search.Symbol)} />
            }) : <div></div>}
        </div >
    )
}

export default MarketSearchResults