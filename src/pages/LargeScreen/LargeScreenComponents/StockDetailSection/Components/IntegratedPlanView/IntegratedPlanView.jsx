import React from 'react'
import { useSelector } from 'react-redux'
import { selectDetailedScoreBreakDownBySymbol } from '../../../../../../features/Engine/EnginePlanApiSlice'
import './IntegratedPlanView.css'

function IntegratedPlanView({ tickerSymbol })
{

    console.log(tickerSymbol)
    const selectedPlannedTicker = useSelector((state) => selectDetailedScoreBreakDownBySymbol(state, tickerSymbol))
    console.log(selectedPlannedTicker)
    return (
        <div>
            <p>IntegratedPlanView</p>
            <p>{selectedPlannedTicker?.planConfig.tickerSymbol}</p>

        </div>
    )
}

export default IntegratedPlanView