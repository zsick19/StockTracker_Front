import React from 'react'
import { useFetchMacroDailyZoneInfoQuery, useFetchUsersMacroWatchListQuery } from '../../../../../../../features/WatchList/WatchListStreamingSliceApi'
import { allSectorTickers } from '../../../../../../../Utilities/SectorsAndIndustries'
import SingleMacroCondition from './SingleMacroCondition'
import '../MacroConditionsStyles.css'

function MacroConditions()
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useFetchMacroDailyZoneInfoQuery()

    let sectorContent
    if (isSuccess)
    {
        sectorContent = allSectorTickers.map((ticker) => <SingleMacroCondition macroTicker={ticker} zoneData={data[ticker]} />)
    } else if (isLoading)
    {
        sectorContent = <p>Loading</p>
    }

    return (
        <div id='MacroConditionVisuals'>

            {sectorContent}
            <div></div>
        </div>


    )
}

export default MacroConditions