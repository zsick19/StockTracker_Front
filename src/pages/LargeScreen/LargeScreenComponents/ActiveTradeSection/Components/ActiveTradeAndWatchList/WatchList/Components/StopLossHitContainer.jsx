import React, { useState } from 'react'
import { Grip, SpellCheck } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import SinglePlannedTickerDisplay from './SinglePlannedTickerDisplay'
import SingleHighImportanceTickerDisplay from './SingleHighImportanceTickerDisplay'

function StopLossHitContainer({ stopLossHitIds })
{
    const dispatch = useDispatch()
    const [sectorHighlight, setSectorHighlight] = useState('all')
    const [showSectorSelect, setShowSectorSelect] = useState(false)


    return (
        <div id='LSH-PreWatchStopLosHit'>
            <div>
                <p>Stop Loss Hit</p>
                <button className='iconButton' onClick={() => dispatch(setStockDetailState(6))}><Grip size={20} color='white' /></button>
            </div>

            <div className='hide-scrollbar PreWatchListContainersEveryOther'>
                {stopLossHitIds.map((id) => <SingleHighImportanceTickerDisplay id={id} watchList={1} key={`stopLossHit${id}`} sectorHighlight={sectorHighlight} />)}
            </div>
        </div>
    )
}

export default StopLossHitContainer