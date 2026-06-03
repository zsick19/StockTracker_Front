import React, { useMemo } from 'react'
import { enterExitPlanSectorFilter, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { sectorToTicker } from '../../../../../../../Utilities/SectorsAndIndustries'

function SectorViewHighImportance({ sector })
{
    const selectFilteredData = useMemo(() => enterExitPlanSectorFilter(sectorToTicker[sector]), [sector])
    const { data: highImportancePlans } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: (results) => ({
            ...results,
            data: selectFilteredData(results)
        })
    })
    return (
        <div>
            {highImportancePlans.map((t) => <div className='flex'>
                <p>{t.tickerSymbol}</p>
                <p>{t.correlationValues.sector}</p>
            </div>)}
        </div>
    )
}

export default SectorViewHighImportance