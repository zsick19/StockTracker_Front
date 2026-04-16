import React, { useState } from 'react'
import { useFetchMacroDailyZoneInfoQuery } from '../../../../../../../../features/WatchList/WatchListStreamingSliceApi'
import SingleMacroCondition from '../../../MessageCenter/Components/SingleMacroCondition'
import { allSectorTickers } from '../../../../../../../../Utilities/SectorsAndIndustries'
import SingleMacroZone from './Components/SingleMacroZone'
import './SectorZones.css'
import { isWeekend } from 'date-fns'

function SectorZones()
{
    const pollingInterval = isWeekend(new Date()) ? 0 : 300000
    const { data, isSuccess, isLoading, isError, error, refetch } = useFetchMacroDailyZoneInfoQuery(undefined, { pollingInterval: pollingInterval })
    const [selectedMacro, setSelectedMacro] = useState(undefined)

    let sectorContent
    if (isSuccess)
    {
        sectorContent = <div id='SectorZones' onDoubleClick={refetch}>
            {allSectorTickers.map((ticker) => <SingleMacroZone macroTicker={ticker} zoneData={data[ticker]?.dailyZone}
                candleData={data[ticker]?.candleData}
                setSelectedMacro={setSelectedMacro} key={`sectorZone${ticker}`} />)}
        </div>
    } else if (isLoading)
    {
        sectorContent = <p>Loading</p>
    }

    return (
        <>
            {selectedMacro ? <div>
                single Macro
            </div> :
                <>
                    {sectorContent}
                </>}
        </>
    )
}

export default SectorZones