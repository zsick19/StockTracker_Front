import React from 'react'
import { useSelector } from 'react-redux'
import { selectPlansMacroCorrelations } from '../../../../../../../../features/Engine/EnginePlanApiSlice'

function MacroChartWrapper({ plan, macroTicker })
{
    const macroPlan = useSelector((state) => selectPlansMacroCorrelations(state, macroTicker))




    
    return (
        <div className='MacroChartWrapper'>
            <div className='flex'>
                <p>{macroPlan.id}</p>
                <p>${macroPlan.mostRecentPrice}</p>
            </div>
            <div>
                {macroPlan.combinedCandleData.length}
            </div>
        </div>
    )
}

export default MacroChartWrapper