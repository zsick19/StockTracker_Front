import React from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentTradeTickers } from '../../../../../../../features/Trades/TradeSliceApi'
import { useGetMajorMacroNewsQuery } from '../../../../../../../features/NewsFeed/NewsFeedApiSlice'
import SingleNewsArticle from './SingleNewsArticle'

function CurrentTradeNewsFeed()
{

   
    const tradeTickers = useSelector(state => selectCurrentTradeTickers(state))
    const { data, isLoading, isSuccess, isError, error } = useGetMajorMacroNewsQuery({ tickersToSearch: tradeTickers }, { pollingInterval: 36000 })
    console.log(data)
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
        </div>
    )
}

export default CurrentTradeNewsFeed