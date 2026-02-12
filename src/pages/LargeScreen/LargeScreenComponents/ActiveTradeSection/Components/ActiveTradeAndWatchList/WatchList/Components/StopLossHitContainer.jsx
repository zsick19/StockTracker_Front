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
                <button className='iconButton' onClick={() => dispatch(setStockDetailState(6))}><Grip size={20} color='white' /></button>
            </div>

            <div className='hide-scrollbar PreWatchListContainersEveryOther'>
                {stopLossHitIds.map((id) => <SinglePlannedTickerDisplay id={id} watchList={1} key={`stopLossHit${id}`} />)}
            </div>
        </div>
    )
}

export default StopLossHitContainer