import React, { useRef, useState } from 'react'
import SinglePlannedTickerDisplay from './SinglePlannedTickerDisplay'
import { CircleX, Grip, SpellCheck, Star } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { defaultSectors } from '../../../../../../../../Utilities/SectorsAndIndustries'

function PlannedTrackingContainer({ enterExitPlansIds, handleSwitchingWatchList })
{
    const dispatch = useDispatch()

    return (
        <div >

            < div >
                <p onClick={() => handleSwitchingWatchList()}>Planned Tickers</p>
                <button className='iconButton' onClick={() => dispatch(setStockDetailState(12))}><Grip size={20} color='white' /></button>
            </div >



            <div className='hide-scrollbar PreWatchListContainersEveryOther'>
                {enterExitPlansIds.map((id) => { return <SinglePlannedTickerDisplay id={id} watchList={2} key={`enterExitList${id}`} /> })}
            </div>
        </div >
    )
}

export default PlannedTrackingContainer