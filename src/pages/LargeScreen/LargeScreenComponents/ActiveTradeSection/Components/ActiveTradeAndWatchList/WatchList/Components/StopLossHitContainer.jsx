import React from 'react'
import { Grip, SpellCheck } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import SinglePlannedTickerDisplay from './SinglePlannedTickerDisplay'

function StopLossHitContainer({ stopLossHitIds })
{
    const dispatch = useDispatch()

    return (
        <div id='LSH-PreWatchStopLosHit'>
            <div>
                <p>Stop Loss Hit</p>


                <div className='flex'>
                    <button className='iconButton' onClick={() => dispatch(setStockDetailState(4))}><SpellCheck size={18} color='white' /></button>
                    <button className='iconButton'><Grip size={20} color='white' /></button>
                </div>
            </div>

            <div className='hide-scrollbar'>
                {stopLossHitIds.map((id) => <SinglePlannedTickerDisplay id={id} watchList={1} />)}
            </div>
        </div>
    )
}

export default StopLossHitContainer