import { CircleX, Flashlight, FlashlightOff, Grip } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SingleHighImportanceTickerDisplay from './SingleHighImportanceTickerDisplay'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { defaultSectors } from '../../../../../../../../Utilities/SectorsAndIndustries'
import { selectCombinedHighImportance, enterExitPlanSectorFilter, useGetUsersEnterExitPlanQuery } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import PreCheckedTickerDisplay from '../TradeReadyComponents/PreCheckedTickerDisplay'

function HighImportanceWatchListContainer({ handleSwitchingWatchList })
{
    const dispatch = useDispatch()
    const [showSectorSelect, setShowSectorSelect] = useState(false)

    const [sectorHighlight, setSectorHighlight] = useState('all')
    const selectFilteredData = useMemo(() => enterExitPlanSectorFilter(sectorHighlight), [sectorHighlight])
    const { data: highImportancePlans } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: (results) => ({
            ...results,
            data: selectFilteredData(results)
        })
    })

    return (
        <div className='watchListWithSectorSelect'>
            {showSectorSelect ?
                <div className='WatchListSectorSelect'>
                    <select name="" id="" value={sectorHighlight} onChange={e => { setSectorHighlight(e.target.value); setShowSectorSelect(false) }} >
                        <option value="all">All Sectors</option>
                        {defaultSectors.map((sector) => <option value={sector}>{sector}</option>)}
                    </select>
                    <button onClick={() => { setShowSectorSelect(false) }} className='buttonIcon'><CircleX color='white' size={18} /></button>
                </div>
                :
                <div>
                    <p onClick={handleSwitchingWatchList} className='orangeFont'>High Importance</p>
                    <button className='iconButton' onClick={() => { setShowSectorSelect(prev => !prev) }}><Flashlight size={18} color='orange' /></button>
                    {sectorHighlight !== 'all' && <button onClick={() => setSectorHighlight('all')} className='iconButton'><FlashlightOff size={18} /></button>}
                    <button className='iconButton' onClick={() => dispatch(setStockDetailState(13))}><Grip size={18} color='orange' /></button>
                </div>
            }




            <div id='LSH-PreWatchHighImportance' className='hide-scrollbar PreWatchListContainersEveryOther'>
                {highImportancePlans.map((id, i) => <PreCheckedTickerDisplay plan={id} key={`highImportance${id.tickerSymbol}`} sectorHighlight={sectorHighlight} />)}
            </div>


        </div>
    )
}

export default HighImportanceWatchListContainer