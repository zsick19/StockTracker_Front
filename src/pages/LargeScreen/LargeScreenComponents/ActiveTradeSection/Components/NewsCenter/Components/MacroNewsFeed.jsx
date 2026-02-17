import React, { useState } from 'react'
import { useGetMajorMacroNewsQuery } from '../../../../../../../features/NewsFeed/NewsFeedApiSlice'
import SingleNewsArticle from './SingleNewsArticle'

function MacroNewsFeed()
{
    const [tickersToSearch, setTickersToSearch] = useState(['SPY', 'DIA', 'QQQ', 'IWM', 'TLT'])

    const { data, isLoading, isSuccess, isError, error } = useGetMajorMacroNewsQuery({ tickersToSearch }, { pollingInterval: () => avoidPollingAfterHours() })

    function avoidPollingAfterHours()
    {
        const currentTime = new Date().getHours()
        if (currentTime > 18 && currentTime < 24) return 0
        else if (currentTime < 6) return 0
        else return 3600
    }
    let newsContent
    if (isSuccess)
    {
        newsContent = data.map((article) => <SingleNewsArticle article={article} />)
    }


    function handleMacroFeedChange(e)
    {
        if (e.target.value === 'all') setTickersToSearch(['SPY', 'DIA', 'QQQ', 'IWM', 'TLT'])
        else setTickersToSearch([e.target.value])
        e.target.blur()
    }

    return (
        <div>
            <div className='IncomingNewsFeed hide-scrollbar'>
                {newsContent}
            </div>
            <div className='newsFeedOptionSelect'>
                <p>Select A Feed:</p>
                <select onChange={(e) => handleMacroFeedChange(e)}>
                    <option value="all">All Macros</option>
                    <option value="SPY">SPY</option>
                    <option value="QQQ">QQQ</option>
                    <option value="DIA">DIA</option>
                    <option value="IWM">IWM</option>
                    <option value="TLT">TLT</option>
                    {/* <option value="/ES">Futures</option> */}
                    <option value="VIX">VIX</option>
                </select>
            </div>
        </div>
    )
}

export default MacroNewsFeed