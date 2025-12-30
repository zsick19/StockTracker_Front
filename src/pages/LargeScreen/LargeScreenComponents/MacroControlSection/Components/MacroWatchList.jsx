import { ChevronDown, ChevronsDown, ChevronUp, CircleMinus } from 'lucide-react'
import { useRef, useState } from 'react'
import '../Components/MacroWatchList.css'
import { useAddTickerToWatchListMutation, useRemoveTickerFromWatchListMutation } from '../../../../../features/WatchList/WatchListSliceApi'

function MacroWatchList({ watchList, setPrimaryChartTicker, setSecondaryChartTicker })
{
    const tickerToAddRef = useRef()
    const [displayTickers, setDisplayTickers] = useState(true)

    const [addTickerToWatchList] = useAddTickerToWatchListMutation()
    const [removeTickerFromWatchList] = useRemoveTickerFromWatchListMutation()

    async function attemptToAddTickerToWatchList(e)
    {
        e.preventDefault()
        const tickerToAdd = tickerToAddRef.current.value.toUpperCase()
        if (tickerToAdd === '' || tickerToAdd.length > 6) { tickerToAddRef.current.value = ''; return }

        let tickerAlreadyInWatchList = false
        watchList.tickersContained.map((ticker) => { if (ticker.ticker === tickerToAdd) { tickerAlreadyInWatchList = true; return } })
        if (tickerAlreadyInWatchList) { tickerToAddRef.current.value = ''; return }

        try
        {
            const results = await addTickerToWatchList({ watchlistId: watchList._id, tickerToAdd: tickerToAdd }).unwrap()
            console.log(results)
        } catch (error)
        {
            console.log(error)
        }
        tickerToAddRef.current.value = ''
    }

    async function attemptRemoveTickerFromWatchList(tickerToRemove)
    {
        try
        {
            await removeTickerFromWatchList({ watchlistId: watchList._id, tickerToRemove: tickerToRemove }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }

    return (
        <div className='LSH-WatchListWrapper'>
            <div className='LSH-WatchListTitle' onClick={() => setDisplayTickers(prev => !prev)}>
                <p>{watchList.title}</p>
                <button >{displayTickers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
            </div>
            {displayTickers && <div className='LSH-WatchListTickerOpen'>
                {watchList.tickersContained.map((ticker, index) =>
                    <div className={`${index % 2 == 0 && 'everyOther'} LSH-SingleTickerTitle`} onClick={() => setPrimaryChartTicker(ticker)} onDoubleClick={() => { setPrimaryChartTicker(ticker); setSecondaryChartTicker(ticker) }}>
                        <button onClick={(e) => { e.stopPropagation(); setSecondaryChartTicker(ticker) }}><ChevronsDown size={16} color='white' /></button>
                        <p>{ticker.ticker}</p>
                        <p>$111.23</p>
                        <p>3%</p>
                        <button onClick={(e) => { e.stopPropagation(); attemptRemoveTickerFromWatchList(ticker.ticker) }}><CircleMinus size={16} color='white' /></button>
                    </div>)}
                <form onSubmit={attemptToAddTickerToWatchList} className='LSH-WatchListAddTickerForm'>
                    <input type="text" ref={tickerToAddRef} placeholder='Add Ticker' />
                </form>
            </div>}
        </div>
    )
}

export default MacroWatchList