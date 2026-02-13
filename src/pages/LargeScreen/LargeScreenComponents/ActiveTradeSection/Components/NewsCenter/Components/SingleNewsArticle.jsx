import React from 'react'
import { Link } from 'react-router-dom'

function SingleNewsArticle({ article })
{

    return (
        <div className='singleNewsArticle'>
            <p>{article.Headline}</p>
            <button><a href={article.URL} target="_blank" rel="noopener noreferrer">Link</a></button>
        </div>
    )
}

export default SingleNewsArticle