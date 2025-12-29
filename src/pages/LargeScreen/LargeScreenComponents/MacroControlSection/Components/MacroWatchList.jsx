import { ChevronDown, ChevronUp, CirclePlus } from 'lucide-react'
import React, { useState } from 'react'
import '../Components/MacroWatchList.css'

function MacroWatchList({ watchList, setPrimaryChartTicker })
{
    const [displayTickers, setDisplayTickers] = useState(false)

    return (
        <div className='LSH-WatchListWrapper'>
            <div className='LSH-WatchListTitle'>
                <p>{watchList.title}</p>
                <button onClick={() => setDisplayTickers(prev => !prev)}>{displayTickers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
            </div>
            {displayTickers && <div className='LSH-WatchListTickerOpen'>
                {watchList.tickers.map((ticker, index) =>
                    <div className={`${index % 2 == 0 && 'everyOther'} LSH-SingleTickerTitle`} onClick={() => setPrimaryChartTicker(ticker)}>
                        <p>{ticker}</p>
                        <p>$111.23</p>
                        <p>3%</p>
                        <button><CirclePlus size={16} color='white' /></button>
                    </div>)}
            </div>}
        </div>
    )
}

export default MacroWatchList