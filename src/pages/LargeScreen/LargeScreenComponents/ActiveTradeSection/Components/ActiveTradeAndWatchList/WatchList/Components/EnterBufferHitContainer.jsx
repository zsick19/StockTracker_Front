import React from 'react'
import { Grip, RefreshCcwDot } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import SinglePlannedTickerDisplay from './SinglePlannedTickerDisplay'

function EnterBufferHitContainer({ enterBufferHitIds, refetch })
{
    const dispatch = useDispatch()
    function handleEnterBufferNavigateToViewMany()
    {
        dispatch(setStockDetailState(6))
    }

    return (
        <div>
            <div className='flex'>
                <p>Enter Buffer</p>
                <div className='flex'>
                    <button className='iconButton' onClick={() => refetch()}><RefreshCcwDot size={20} color='gray' /></button>
                    <button className='iconButton' onClick={handleEnterBufferNavigateToViewMany}><Grip size={20} color='white' /></button>
                </div>
            </div>
            <div id='LSH-PreWatchBufferHitList' className='hide-scrollbar'>
                {enterBufferHitIds.map((id) => <SinglePlannedTickerDisplay id={id} watchList={0} />)}
            </div>
        </div>
    )
}

export default EnterBufferHitContainer