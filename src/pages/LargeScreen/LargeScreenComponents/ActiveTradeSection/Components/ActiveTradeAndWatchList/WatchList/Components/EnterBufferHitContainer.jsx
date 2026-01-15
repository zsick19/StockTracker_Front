import React from 'react'
import SingleEnterBufferHitDisplay from './SingleEnterBufferHitDisplay'
import { Grip } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function EnterBufferHitContainer({ enterBufferHitIds })
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
                <button className='iconButton' onClick={handleEnterBufferNavigateToViewMany}><Grip size={20} color='white' /></button>
            </div>
            <div id='LSH-PreWatchBufferHitList' className='hide-scrollbar'>
                {enterBufferHitIds.map((id) => <SingleEnterBufferHitDisplay id={id} />)}
            </div>
        </div>
    )
}

export default EnterBufferHitContainer