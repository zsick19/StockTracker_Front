import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'

function MacroWatchList({ watchList })
{
    const [displayTickers, setDisplayTickers] = useState(false)

    return (
        <div className='LSH-WatchListWrapper'>
            <div className='flex LSH-WatchListTitle'>
                <p>{watchList.title}</p>
                <button onClick={() => setDisplayTickers(prev => !prev)}>{displayTickers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
            </div>
            {displayTickers && <div className='LSH-WatchListTickerOpen'>{watchList.tickers.map((ticker) => <div><p>{ticker}</p></div>)}</div>}
        </div>
    )
}

export default MacroWatchList