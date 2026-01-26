import React from 'react'
import { useSelector } from 'react-redux'
import { selectStockNews } from '../../../../../../../../features/StockData/StockInfoElement'
import { Link } from 'react-router-dom'

function NewsPanel()
{
    const stockNews = useSelector(selectStockNews)

    return (
        <div id='NewsPanel' className='hide-scrollbar'>
            {stockNews.map((news) =>
                <div className='flex '>
                    <p>{news.Headline}</p>

                    <a href={news.URL} target="_blank" rel="noopener noreferrer">
                        Open
                    </a>
                    <p>{news.CreatedAt}</p>
                    <p>{news.UpdatedAt}</p>
                </div>)}
        </div>
    )
}

export default NewsPanel