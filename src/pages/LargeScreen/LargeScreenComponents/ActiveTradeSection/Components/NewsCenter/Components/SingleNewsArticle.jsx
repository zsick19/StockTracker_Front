import { format } from 'date-fns'
import { ExternalLink } from 'lucide-react'

function SingleNewsArticle({ article })
{

    return (
        <div className='singleNewsArticle'>

            <p>{article.Headline}</p>

            <div className='flex'>
                <p>{format(article.UpdatedAt, 'EEEE, MMMM do, h:mm a')}</p>
                <button className='buttonIcon'><a href={article.URL} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /></a></button>
            </div>
        </div>
    )
}

export default SingleNewsArticle