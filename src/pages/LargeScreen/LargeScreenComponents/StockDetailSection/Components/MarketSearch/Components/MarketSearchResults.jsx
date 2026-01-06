import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectUsersPatternedHistory } from '../../../../../../../features/Initializations/InitializationSliceApi'
import SingleSearchResultBlock from './SingleSearchResultBlock'

function MarketSearchResults({ searchResults })
{
    const memoizedUserPatterns = useMemo(() => selectUsersPatternedHistory(), [])
    const patterns = useSelector(memoizedUserPatterns)



    return (
        <div id='LHS-MarketSearchResultBlocks'>
            {searchResults.map((search) => { return <SingleSearchResultBlock search={search} found={patterns.includes(search.Symbol)} /> })}
        </div >
    )
}

export default MarketSearchResults