import React, { useState } from 'react'
import { useFetchMacroDailyZoneInfoQuery, useFetchUsersMacroWatchListQuery } from '../../../../../../../features/WatchList/WatchListStreamingSliceApi'
import { allSectorTickers } from '../../../../../../../Utilities/SectorsAndIndustries'
import SingleMacroCondition from './SingleMacroCondition'
import SingleSelectedMacroCondition from './SingleSelectedMacroCondition'

function MacroConditions()
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useFetchMacroDailyZoneInfoQuery(undefined, { pollingInterval: 30000 })
    const [selectedMacro, setSelectedMacro] = useState(undefined)

    let sectorContent
    if (isSuccess)
    {
        sectorContent = allSectorTickers.map((ticker) => <SingleMacroCondition macroTicker={ticker} zoneData={data[ticker]} setSelectedMacro={setSelectedMacro} />)
    } else if (isLoading)
    {
        sectorContent = <p>Loading</p>
    }

    return (
        <>
            {selectedMacro ? <SingleSelectedMacroCondition selectedMacro={selectedMacro} setSelectedMacro={setSelectedMacro} zoneData={data[selectedMacro]} /> :
                <div id='MacroConditionVisuals'>
                    {sectorContent}
                    <div></div>
                </div>
            }
        </>


    )
}

export default MacroConditions