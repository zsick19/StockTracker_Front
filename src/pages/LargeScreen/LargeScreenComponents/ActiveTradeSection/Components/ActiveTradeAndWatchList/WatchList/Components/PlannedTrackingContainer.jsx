import React from 'react'
import SinglePlannedTickerDisplay from './SinglePlannedTickerDisplay'
import { Grip, SpellCheck } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function PlannedTrackingContainer({ enterExitPlansIds })
{
    const dispatch = useDispatch()

    return (
        <div id='LSH-PreWatchPlanList'>
            <div>
                <p>Planned Tickers</p>
                <button className='iconButton' onClick={() => dispatch(setStockDetailState(12))}><Grip size={20} color='white' /></button>
            </div>

            <div className='hide-scrollbar PreWatchListContainersEveryOther'>
                {enterExitPlansIds.map((id) => { return <SinglePlannedTickerDisplay id={id} watchList={2} key={`enterExitList${id}`} /> })}
            </div>
        </div>
    )
}

export default PlannedTrackingContainer