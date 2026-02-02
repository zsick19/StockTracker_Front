import { Grip } from 'lucide-react'
import React from 'react'
import { useDispatch } from 'react-redux'
import SingleHighImportanceTickerDisplay from './SingleHighImportanceTickerDisplay'

function HighImportanceWatchListContainer({ highImportanceWatchListIds })
{
    const dispatch = useDispatch()

    return (
        <div>
            <div className='flex'>
                <p>High Importance</p>
                <div className='flex'>
                    <button className='iconButton' onClick={() => dispatch(setStockDetailState(11))}><Grip size={20} color='white' /></button>
                </div>
            </div>

            <div id='LSH-PreWatchHighImportance' className='hide-scrollbar PreWatchListContainersEveryOther'>
                {highImportanceWatchListIds.map((id) => <SingleHighImportanceTickerDisplay id={id} />)}
            </div>
        </div>
    )
}

export default HighImportanceWatchListContainer