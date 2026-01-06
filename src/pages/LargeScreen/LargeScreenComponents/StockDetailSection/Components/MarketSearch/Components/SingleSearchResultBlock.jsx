import React, { useState } from 'react'
import { useAddTickerToUserPatternsMutation } from '../../../../../../../features/StockActions/PatternSliceApi'

function SingleSearchResultBlock({ search, found })
{
    const [addTickerToUserPatterns] = useAddTickerToUserPatternsMutation()
    const [addRemoveErrorMessage, setAddRemoveErrorMessage] = useState(undefined)

    async function attemptToTogglePattern(search)
    {
        try
        {
            const results = await addTickerToUserPatterns({ patternToAdd: search.Symbol, addOrRemove: !found })
        } catch (error)
        {
            console.log(error)
        }
    }



    return (
        <div className='LHS-MarketSearchResultGraphWrapper' onClick={() => attemptToTogglePattern(search)}>
            <div className='ChartGraphWrapper'>
                <p>Chart will go here</p>
            </div>

            <div className={`MarketSearchResultInfoBar ${found ? 'patterned' : ''}`}>
                <p>{search.Symbol}</p>
                <p>{search.Sector}</p>
                <p>{search.AvgVolume}</p>
            </div>

        </div>
    )
}

export default SingleSearchResultBlock