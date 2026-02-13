import { ExternalLink } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

function SingleNewsArticle({ article })
{

    return (
        <div className='singleNewsArticle'>
            <p>{article.Headline}</p>
            <button className='buttonIcon'><a href={article.URL} target="_blank" rel="noopener noreferrer"><ExternalLink /></a></button>
        </div>
    )
}

export default SingleNewsArticle