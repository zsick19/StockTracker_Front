import React from 'react'
import SingleStopLostHitDisplay from './SingleStopLostHitDisplay'
import { Grip, SpellCheck } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'

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
                {stopLossHitIds.map((id) => <SingleStopLostHitDisplay id={id} />)}
            </div>
        </div>
    )
}

export default StopLossHitContainer