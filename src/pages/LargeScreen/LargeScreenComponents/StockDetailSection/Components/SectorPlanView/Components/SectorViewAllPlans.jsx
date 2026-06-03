import React, { useMemo } from 'react'
import { enterExitBySector, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { sectorToTicker } from '../../../../../../../Utilities/SectorsAndIndustries'

function SectorViewAllPlans({ sector })
{


    const selectFilteredData = useMemo(() => enterExitBySector(sectorToTicker[sector]), [sector])
    const { data: allPlansBySector } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: (results) => ({
            ...results,
            data: selectFilteredData(results)
        })
    })

    return (
        <div>
            {allPlansBySector.map((t) => <div className='flex'>
                <p>{t.tickerSymbol}</p>
                <p>{t.correlationValues.sector}</p>
            </div>)}
        </div>
    )
}

export default SectorViewAllPlans