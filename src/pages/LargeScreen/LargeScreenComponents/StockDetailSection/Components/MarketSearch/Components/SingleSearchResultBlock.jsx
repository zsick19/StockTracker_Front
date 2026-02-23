import React, { useEffect, useState } from 'react'
import { useAddTickerToUserPatternsMutation, useRemoveTickerFromUserPatternsMutation } from '../../../../../../../features/StockActions/PatternSliceApi'
import { useGetUserInitializationQuery } from '../../../../../../../features/Initializations/InitializationSliceApi'
import ChartGraph from '../../../../../../../components/ChartSubGraph/ChartGraph'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import { abbreviateNumber } from '../../../../../../../Utilities/UtilityHelperFunctions'

function SingleSearchResultBlock({ search, found, index })
{
    const [addTickerToUserPatterns] = useAddTickerToUserPatternsMutation()
    const [removeTickerFromUserPatterns] = useRemoveTickerFromUserPatternsMutation()

    const [addRemoveErrorMessage, setAddRemoveErrorMessage] = useState(undefined)

    const { item } = useGetUserInitializationQuery(undefined, { selectFromResult: ({ data }) => ({ item: data?.userStockHistory.find((i) => i.symbol === search.Symbol), }), skip: !found, });
    const [mostRecentAction, setMostRecentAction] = useState(item ? item.history.at(-1).action : undefined)

    async function attemptToAddPattern(search)
    {
        try
        {
            await addTickerToUserPatterns({ patternToAdd: search.Symbol })
            setMostRecentAction('patterned')
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
            setMostRecentAction(undefined)
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


    useEffect(() =>
    {
        document.addEventListener('keydown', checkKeyPressForAction)

        function checkKeyPressForAction(e)
        {
            e.preventDefault()
            if (document.activeElement.tagName.toLowerCase() === 'input' || document.activeElement.tagName.toLowerCase() === 'textarea') return;
            if (e.key === '7' && index === 0) handleClickToggleAction(search)
            else if (e.key === '8' && index === 1) handleClickToggleAction(search)
            else if (e.key === '9' && index === 2) handleClickToggleAction(search)

            else if (e.key === '4' && index === 3) handleClickToggleAction(search)
            else if (e.key === '5' && index === 4) handleClickToggleAction(search)
            else if (e.key === '6' && index === 5) handleClickToggleAction(search)

            else if (e.key === '1' && index === 6) handleClickToggleAction(search)
            else if (e.key === '2' && index === 7) handleClickToggleAction(search)
            else if (e.key === '3' && index === 8) handleClickToggleAction(search)
        }

        return () => { document.removeEventListener('keydown', checkKeyPressForAction) }
    }, [item, mostRecentAction])





    return (
        <div className='LHS-MarketSearchResultGraphWrapper' onClick={() => handleClickToggleAction(search)}>

            {search.candleData ?
                <div className='ChartGraphWrapper'>
                    <ChartGraph ticker={{ ticker: search.Symbol }} isInteractive={false} isLivePrice={false} isZoomAble={false} candleData={search.candleData} timeFrame={defaultTimeFrames.dailyQuarter} nonInteractive={true} nonZoomAble={true} />
                </div > : <div className='MarketSearchNoCandleData'>
                    <p >No Data For This Ticker</p>
                </div>
            }

            <div className={`MarketSearchResultInfoBar ${found ? mostRecentAction : ''}`}>
                <p>{search.Symbol}</p>
                <p>{search.Sector}</p>
                <p className={search.AvgVolume > 300000 ? 'MarketSearchHighVol' : 'MarketSearchLowVol'}>{abbreviateNumber(search.AvgVolume)}</p>
            </div>

        </div>
    )
}

export default SingleSearchResultBlock