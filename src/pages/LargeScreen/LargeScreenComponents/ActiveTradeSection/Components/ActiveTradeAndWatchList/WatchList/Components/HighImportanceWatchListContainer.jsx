import { CircleX, Grip } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import SingleHighImportanceTickerDisplay from './SingleHighImportanceTickerDisplay'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { defaultSectors } from '../../../../../../../../Utilities/SectorsAndIndustries'

function HighImportanceWatchListContainer({ highImportanceWatchListIds })
{
    const dispatch = useDispatch()


    const [sectorHighlight, setSectorHighlight] = useState('all')
    const [showSectorSelect, setShowSectorSelect] = useState(false)

    return (
        <div>
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
                    <p onClick={() => { setShowSectorSelect(prev => !prev); }} className='orangeFont'>High Importance</p>
                    <button className='iconButton' onClick={() => dispatch(setStockDetailState(13))}><Grip size={20} color='orange' /></button>
                </div>
            }




            <div id='LSH-PreWatchHighImportance' className='hide-scrollbar PreWatchListContainersEveryOther'>
                {highImportanceWatchListIds.map((id, i) => <SingleHighImportanceTickerDisplay id={id} watchList={4} key={`highImportance${id}`} sectorHighlight={sectorHighlight} />)}
            </div>
        </div>
    )
}

export default HighImportanceWatchListContainer