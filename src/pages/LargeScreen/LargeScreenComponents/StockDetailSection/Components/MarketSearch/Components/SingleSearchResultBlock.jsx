import React, { useState } from 'react'
import { useAddTickerToUserPatternsMutation, useRemoveTickerFromUserPatternsMutation } from '../../../../../../../features/StockActions/PatternSliceApi'
import { useGetUserInitializationQuery } from '../../../../../../../features/Initializations/InitializationSliceApi'
import ChartGraph from '../../../../../../../components/ChartSubGraph/ChartGraph'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import { abbreviateNumber } from '../../../../../../../Utilities/UtilityHelperFunctions'

function SingleSearchResultBlock({ search, found })
{
    const [addTickerToUserPatterns] = useAddTickerToUserPatternsMutation()
    const [removeTickerFromUserPatterns] = useRemoveTickerFromUserPatternsMutation()

    const [addRemoveErrorMessage, setAddRemoveErrorMessage] = useState(undefined)

    const { item } = useGetUserInitializationQuery(undefined, {
        selectFromResult: ({ data }) => ({
            item: data?.userStockHistory.find((i) => i.symbol === search.Symbol),
        }), skip: !found,
    });

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

    async function attemptToRemovePattern()
    {
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
        if (!search.candleData) return
        if (mostRecentAction && mostRecentAction !== 'patterned') return
        else if (mostRecentAction) { attemptToRemovePattern() }
        else { attemptToAddPattern(search) }
    }

    let avgVolumeAbbreviated = abbreviateNumber(search.AvgVolume)

    return (
        <div className='LHS-MarketSearchResultGraphWrapper' onClick={() => handleClickToggleAction(search)}>

            {search.candleData ?
                <div className='ChartGraphWrapper'>
                    <ChartGraph ticker={{ ticker: search.Symbol }} isInteractive={false} isLivePrice={false} isZoomAble={false} candleData={search.candleData} timeFrame={defaultTimeFrames.dailyHalfYear} nonInteractive={true} nonZoomAble={true} />
                </div > : <div className='MarketSearchNoCandleData'>
                    <p >No Data For This Ticker</p>
                </div>
            }

            <div className={`MarketSearchResultInfoBar ${found ? mostRecentAction : ''}`}>
                <p>{search.Symbol}</p>
                <p>{search.Sector}</p>
                <p className={search.AvgVolume > 300000 ? 'MarketSearchHighVol' : 'MarketSearchLowVol'}>{avgVolumeAbbreviated}</p>
            </div>

        </div>
    )
}

export default SingleSearchResultBlock