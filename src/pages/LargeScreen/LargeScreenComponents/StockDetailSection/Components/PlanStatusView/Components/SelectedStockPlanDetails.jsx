import React from 'react'

function SelectedStockPlanDetails({ selectedPlan, setSelectedPlan })
{
    return (
        <div id='LHS-SelectedPlanDetails'>
            <h1>{selectedPlan.tickerSymbol}</h1>
            <button onClick={() => setSelectedPlan(undefined)}>Clear</button>
            <button>Remove Plan</button>
        </div>)
}

export default SelectedStockPlanDetails