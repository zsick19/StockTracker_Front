import React from 'react'
import { useGetTickerNewsWithAnalysisQuery } from '../../../../../../../../features/NewsFeed/NewsFeedApiSlice'
import { format } from 'date-fns'

function NewsReview({ plan })
{
    const { data, isSuccess, isError, error, isLoading, refetch } = useGetTickerNewsWithAnalysisQuery({ tickersToSearch: plan.id })

    let newsContent
    if (isSuccess)
    {
        // console.log(data[0])
        newsContent =
            <div className='HeadLineContainer'>
                {data.map((t, i) => <div className='NewsHeadline'>
                    <p>{t.headline}</p>
                    <p>{format(new Date(t.updatedDate), 'MM/dd/yyyy')}</p>
                    <p>{t.analysis.risk_level}</p>
                    <p>{t.analysis.action_signal}</p>
                    <p>{t.sector[1]}</p>
                    {/* <p>{t.analysis.signal_type === 'NO_SIGNAL' ? 'Neutral' : t.analysis.signal_type}</p> */}
                </div>)}
            </div>

    } else if (isLoading)
    {
        newsContent = <div>Loading News</div>
    } else if (isError)
    {
        newsContent = <div>Error</div>
    }
    return (
        <div style={{ fontSize: '12px' }} id='NewsExpandedReview'>
            <div>
                <h2>Headline</h2>
                <h2>Publish Date</h2>
                <h2>Risk Level</h2>
                <h2>Action</h2>
                <h2>Signal</h2>
            </div>
            {newsContent}

        </div>
    )
}

export default NewsReview