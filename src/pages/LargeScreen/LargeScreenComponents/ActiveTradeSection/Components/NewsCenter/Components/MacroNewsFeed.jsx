import React, { useState } from 'react'
import { useGetMajorMacroNewsQuery } from '../../../../../../../features/NewsFeed/NewsFeedApiSlice'
import SingleNewsArticle from './SingleNewsArticle'

function MacroNewsFeed()
{
    const [tickersToSearch, setTickersToSearch] = useState(['SPY', 'DIA', 'QQQ', 'ES', 'IWM', 'TLT'])
    const { data, isLoading, isSuccess, isError, error } = useGetMajorMacroNewsQuery({ tickersToSearch }, { pollingInterval: 36000 })

    let newsContent
    if (isSuccess)
    {
        newsContent = data.map((article) => <SingleNewsArticle article={article} />)
    }

    return (
        <div>
            <div className='IncomingNewsFeed hide-scrollbar'>
                {newsContent}
            </div>
            <div>
                <button onClick={() => setTickersToSearch(['SPY', 'DIA', 'QQQ', 'ES', 'IWM', 'TLT'])}>All Macro</button>
                <button onClick={() => setTickersToSearch(['SPY'])}>SPY</button>
                <button onClick={() => setTickersToSearch(['QQQ'])}>QQQ</button>
                <button onClick={() => setTickersToSearch(['DIA'])}>DIA</button>
                <button onClick={() => setTickersToSearch(['VIX'])}>VIX</button>

                <button onClick={() => setTickersToSearch(['ES'])}>Futures</button>

            </div>
        </div>
    )
}

export default MacroNewsFeed