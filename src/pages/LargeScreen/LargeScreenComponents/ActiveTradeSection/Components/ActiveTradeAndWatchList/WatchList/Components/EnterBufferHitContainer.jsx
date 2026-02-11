import React from 'react'
import { Grip, RefreshCcwDot } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import SinglePlannedTickerDisplay from './SinglePlannedTickerDisplay'
import SingleHighImportanceTickerDisplay from './SingleHighImportanceTickerDisplay'

function EnterBufferHitContainer({ enterBufferHitIds, refetch })
{
    const dispatch = useDispatch()


    return (
        <div>
            <div className='flex'>
                <p>Enter Buffer</p>
                <div className='flex'>
                    <button className='iconButton' onClick={() => refetch()}><RefreshCcwDot size={20} color='gray' /></button>
                    <button className='iconButton' onClick={() => dispatch(setStockDetailState(11))}><Grip size={20} color='white' /></button>
                </div>
            </div>
            <div id='LSH-PreWatchBufferHitList' className='hide-scrollbar PreWatchListContainersEveryOther'>
                {enterBufferHitIds.map((id) => <SingleHighImportanceTickerDisplay id={id} watchList={0} key={`enterBufferList${id}`} />)}
            </div>
        </div>
    )
}

export default EnterBufferHitContainer