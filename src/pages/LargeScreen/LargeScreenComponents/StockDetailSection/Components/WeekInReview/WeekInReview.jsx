import React, { useEffect } from 'react'
import { useFetchWeeklyPlanResultsQuery } from '../../../../../../features/WeekReview/WeekReviewApiSlice'
import { differenceInBusinessDays } from 'date-fns'

function WeekInReview()
{

    const { data, isSuccess, isLoading, isError, error, refetch } = useFetchWeeklyPlanResultsQuery()
    const [tradesCount, setTradesCount] = useState()

    let reviewContent = []
    if (isSuccess)
    {
        console.log(data.weeklyReview)
        reviewContent = <div style={{ height: '800px', overflowY: 'scroll', fontSize: '12px' }}>
            {data.weeklyReview.filter((t) => t.entered).map((t, i) => <div className='flex'
                style={{ backgroundColor: `${t.maxUnrealizedGainPositionValue > t.maxUnrealizedPainPositionValue ? 'green' : 'red'}` }}>
                <p>{t.tickerSymbol}</p>
                <div>
                    <p>${t.maxUnrealizedPainPositionValue}</p>
                    <p>{t.maxPainPercentage}%</p>
                    <p>${t.lowestLowSeen}</p>
                    <p>{t.stopLossHit ? 'Hit' : 'Not Hit'}</p>
                    <p>{differenceInBusinessDays(t.lowestLowTimestamp, t.enteredTimestamp)}</p>
                </div>
                <br />
                <div>
                    <p>${t.maxUnrealizedGainPositionValue}</p>
                    <p>{t.maxGainPercentage}%</p>
                    <p>${t.highestHighSeen}</p>
                    <p>{t.exitPriceHit ? 'Exit Hit' : 'Not Hit'}</p>
                    <p>{differenceInBusinessDays(t.highestHighTimestamp, t.enteredTimestamp)}</p>
                </div>
            </div>)}
        </div>

    } else if (isLoading)
    {
        reviewContent = <div>Loading...</div>
    } else if (isError)
    {
        reviewContent = <div>Error</div>
    }

    useEffect(() =>
    {
        if (isSuccess) setTradesCount(data.weeklyReview.filter((t) => t.entered).length)
    }, [data])

    return (
        <div>
            WeekInReview <p>{tradesCount}</p>
            {reviewContent}
            <button onClick={() => refetch()}>refetch</button>
        </div>
    )
}

export default WeekInReview