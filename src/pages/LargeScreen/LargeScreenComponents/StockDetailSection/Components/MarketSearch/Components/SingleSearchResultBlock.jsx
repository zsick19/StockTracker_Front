import React, { useState } from 'react'
import { useAddTickerToUserPatternsMutation, useRemoveTickerFromUserPatternsMutation } from '../../../../../../../features/StockActions/PatternSliceApi'
import { useGetUserInitializationQuery } from '../../../../../../../features/Initializations/InitializationSliceApi'
import ChartGraph from '../../../../../../../components/ChartSubGraph/ChartGraph'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'

function SingleSearchResultBlock({ search, found })
{
    const [addTickerToUserPatterns] = useAddTickerToUserPatternsMutation()
    const [removeTickerFromUserPatterns] = useRemoveTickerFromUserPatternsMutation()
    const [showConfirmDeletion, setShowConfirmDeletion] = useState(false)
    const [addRemoveErrorMessage, setAddRemoveErrorMessage] = useState(undefined)

    const { item } = useGetUserInitializationQuery(undefined, { selectFromResult: ({ data }) => ({ item: data?.userStockHistory.find((i) => i.symbol === search.Symbol), }), skip: !found, });
    let mostRecentAction = item ? item.history.at(-1).action : undefined

    async function attemptToAddPattern(search)
    {
        try
        {
            await addTickerToUserPatterns({ patternToAdd: search.Symbol })
        } catch (error)
        {
            console.log(error)
        }
    }

    async function attemptToRemovePatter()
    {
        setShowConfirmDeletion(false)
        try
        {
            const results = await removeTickerFromUserPatterns({ historyId: item._id, ticker: search.Symbol })
            console.log(results)
        } catch (error)
        {
            console.log(error)
        }
    }


    function handleClickToggleAction(search)
    {
        if (mostRecentAction && mostRecentAction !== 'patterned') { setShowConfirmDeletion(true) }
        else if (mostRecentAction) { attemptToRemovePatter() }
        else { attemptToAddPattern(search) }
    }

    return (
        <div className='LHS-MarketSearchResultGraphWrapper' onClick={() => handleClickToggleAction(search)}>
            <div className='ChartGraphWrapper'>
                <ChartGraph ticker={{ ticker: search.Symbol }} candleData={search.candleData} timeFrame={defaultTimeFrames.dailyHalfYear} nonInteractive={true} />
            </div>

            <div className={`MarketSearchResultInfoBar ${found ? mostRecentAction : ''}`}>
                {showConfirmDeletion ?
                    <>
                        <button onClick={(e) => { e.stopPropagation(); attemptToRemovePatter() }}>Confirm Deletion</button>
                        <button onClick={(e) => { e.stopPropagation(); setShowConfirmDeletion(false) }}>Cancel</button>
                    </> :
                    <>
                        <p>{search.Symbol}</p>
                        <p>{search.Sector}</p>
                        <p>{search.AvgVolume}</p>
                    </>
                }
            </div>

        </div>
    )
}

export default SingleSearchResultBlock