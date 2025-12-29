import { ChevronDown, ChevronUp, CirclePlus } from 'lucide-react'
import React, { useState } from 'react'
import '../Components/MacroWatchList.css'

function MacroWatchList({ watchList, setPrimaryChartTicker, setSecondaryChartTicker })
{
    const [displayTickers, setDisplayTickers] = useState(false)

    return (
        <div className='LSH-WatchListWrapper'>
            <div className='LSH-WatchListTitle' onClick={() => setDisplayTickers(prev => !prev)}>
                <p>{watchList.title}</p>
                <button >{displayTickers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
            </div>
            {displayTickers && <div className='LSH-WatchListTickerOpen'>
                {watchList.tickersContained.map((ticker, index) =>
                    <div className={`${index % 2 == 0 && 'everyOther'} LSH-SingleTickerTitle`} onClick={() => setPrimaryChartTicker(ticker)} onDoubleClick={() => { setPrimaryChartTicker(ticker); setSecondaryChartTicker(ticker) }}>
                        <p>{ticker.ticker}</p>
                        <p>$111.23</p>
                        <p>3%</p>
                        <button onClick={(e) => { e.stopPropagation(); setSecondaryChartTicker(ticker) }}><CirclePlus size={16} color='white' /></button>
                    </div>)}
                <div className='LSH-SingleTickerTitle'>
                    Add
                </div>
            </div>}
        </div>
    )
}

export default MacroWatchList