import React, { useRef, useState } from 'react'
import SinglePlannedTickerDisplay from './SinglePlannedTickerDisplay'
import { CircleX, Grip, SpellCheck, Star } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { defaultSectors } from '../../../../../../../../Utilities/SectorsAndIndustries'

function PlannedTrackingContainer({ enterExitPlansIds })
{
    const dispatch = useDispatch()

    const [sectorHighlight, setSectorHighlight] = useState('all')
    const [showSectorSelect, setShowSectorSelect] = useState(false)

    return (
        <div id='LSH-PreWatchPlanList'>
            {showSectorSelect ?
                <div className='WatchListSectorSelect'>
                    <select name="" id="" value={sectorHighlight} onChange={e => { setSectorHighlight(e.target.value); setShowSectorSelect(false) }} >
                        <option value="all">All Sectors</option>
                        {defaultSectors.map((sector) => <option value={sector}>{sector}</option>)}
                    </select>
                    <button onClick={() => { setSectorHighlight('all'); setShowSectorSelect(false) }} className='buttonIcon'><CircleX color='white' size={20} /></button>
                </div>
                :
                <div>
                    <p onClick={() => { setShowSectorSelect(prev => !prev); }}>Planned Tickers</p>
                    <button className='iconButton' onClick={() => dispatch(setStockDetailState(12))}><Grip size={20} color='white' /></button>
                </div>
            }



            <div className='hide-scrollbar PreWatchListContainersEveryOther'>
                {enterExitPlansIds.map((id) => { return <SinglePlannedTickerDisplay id={id} watchList={2} key={`enterExitList${id}`} sectorHighlight={sectorHighlight} /> })}
            </div>
        </div>
    )
}

export default PlannedTrackingContainer