import { ChevronDown, ChevronsDown, ChevronUp, CircleMinus, CircleX, Ellipsis, Undo2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import '../Components/MacroWatchList.css'
import { useAddTickerToWatchListMutation, useDeleteUserWatchListMutation, useRemoveTickerFromWatchListMutation, useUpdateWatchListNameMutation } from '../../../../../features/WatchList/WatchListSliceApi'

function MacroWatchList({ watchList, setPrimaryChartTicker, setSecondaryChartTicker })
{
    const tickerToAddRef = useRef()
    const titleToUpdate = useRef()
    const [displayTickers, setDisplayTickers] = useState(true)
    const [displayWatchlistEdit, setDisplayWatchListEdit] = useState(false)
    const [showDeleteDoubleCheck, setShowDeleteDoubleCheck] = useState(false)

    const [addTickerToWatchList] = useAddTickerToWatchListMutation()
    const [removeTickerFromWatchList] = useRemoveTickerFromWatchListMutation()
    const [updateWatchListName] = useUpdateWatchListNameMutation()
    const [deleteUserWatchList] = useDeleteUserWatchListMutation()

    async function attemptToAddTickerToWatchList(e)
    {
        e.preventDefault()
        const tickerToAdd = tickerToAddRef.current.value.toUpperCase()
        if (tickerToAdd === '' || tickerToAdd.length > 6) { tickerToAddRef.current.value = ''; return }

        let tickerAlreadyInWatchList = false
        watchList.tickersContained.map((ticker) => { if (ticker.ticker === tickerToAdd) { tickerAlreadyInWatchList = true; return } })
        if (tickerAlreadyInWatchList) { tickerToAddRef.current.value = ''; return }

        try { const results = await addTickerToWatchList({ watchlistId: watchList._id, tickerToAdd: tickerToAdd }).unwrap() }
        catch (error) { console.log(error) }
        tickerToAddRef.current.value = ''
    }

    async function attemptRemoveTickerFromWatchList(tickerToRemove)
    {
        try { await removeTickerFromWatchList({ watchlistId: watchList._id, tickerToRemove: tickerToRemove }).unwrap() }
        catch (error) { console.log(error) }
    }

    async function attemptToUpdateWatchListTitle(e)
    {
        e.preventDefault()
        let updatedTitle = titleToUpdate.current.value
        if (updatedTitle === '' || updatedTitle === watchList.title) return
        try
        {
            const results = await updateWatchListName({ watchlistId: watchList._id, updatedTitle: updatedTitle }).unwrap()
            console.log(results)
            titleToUpdate.current.value = ''
            setDisplayWatchListEdit(false)
        } catch (error) { console.log(error) }
    }

    async function attemptToDeleteWatchList()
    {
        try { await deleteUserWatchList({ watchlistId: watchList._id }).unwrap() }
        catch (error) { console.log(error) }
    }


    return (
        <div className='LSH-WatchListWrapper'>
            {displayWatchlistEdit ? <div className='LSH-WatchListEditTitle'>
                <button onClick={() => setShowDeleteDoubleCheck(prev => !prev)}>
                    {showDeleteDoubleCheck ? <Undo2 size={20} color='blue' /> : <CircleMinus size={20} color='red' />}
                </button>
                <form onSubmit={attemptToUpdateWatchListTitle}>
                    {showDeleteDoubleCheck ?
                        <button onClick={() => { attemptToDeleteWatchList(); setDisplayWatchListEdit(false) }} className='flex'>Confirm Delete<CircleX size={20} color='red' /></button> :
                        <input type="text" placeholder={watchList.title} ref={titleToUpdate} />}
                </form>
                {!showDeleteDoubleCheck &&
                    <button onClick={() => { setDisplayWatchListEdit(false); setShowDeleteDoubleCheck(false) }}><CircleX size={20} color='white' /></button>}
            </div> :
                <div className={`${!displayTickers && 'LSH-WatchListTitleClose'} LSH-WatchListTitle`} onClick={() => setDisplayTickers(prev => !prev)}>
                    <p>{watchList.title}</p>
                    <div className='flex'>
                        <button onClick={(e) => { e.stopPropagation(); setDisplayWatchListEdit(true) }}><Ellipsis size={20} /></button>
                        <button >{displayTickers ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
                    </div>
                </div>
            }
            {
                displayTickers && <div className='LSH-WatchListTickerOpen'>
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
                </div>
            }
        </div >
    )
}

export default MacroWatchList