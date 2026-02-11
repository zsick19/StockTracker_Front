import { differenceInBusinessDays } from 'date-fns'
import { AlertCircle, SquareArrowOutUpRight, Trash2, Undo2 } from 'lucide-react'
import React, { useState } from 'react'

function SelectedStockPlanDetails({ selectedPlan, setSelectedPlan })
{
    const [showConfirmRemove, setShowConfirmRemove] = useState(false)

    return (
        <div id='LHS-SelectedPlanDetails'>
            <h1>{selectedPlan.tickerSymbol}</h1>

            <div className='flex'>
                <p>${selectedPlan.mostRecentPrice}</p>
                <p className={selectedPlan.plan.moonPrice < selectedPlan.mostRecentPrice ? 'wayOverPlan' :
                    selectedPlan.plan.stopLossPrice > selectedPlan.mostRecentPrice ? 'wayOverPlan' : 'planStillInPlay'}>
                    {(selectedPlan.percentFromEnter * -1).toFixed(2)}% Away
                </p>
            </div>

            <div>
                <p>{selectedPlan.mostRecentPrice > selectedPlan.initialTrackingPrice ? 'Moving Away From Enter' : 'Moving Towards Enter'}</p>
            </div>

            <div>
                <p>Tracking for {differenceInBusinessDays(new Date(), selectedPlan.dateAdded)} day</p>
                <p>Initial Tracking Price: ${selectedPlan.initialTrackingPrice}</p>
            </div>

            {showConfirmRemove ? <div>
                <button className='buttonIcon'><Trash2 color='red' /></button>
                <button className='buttonIcon' onClick={() => setShowConfirmRemove(false)}><Undo2 color='white' /></button>


            </div> :
                <div>
                    <button className='buttonIcon' onClick={() => setShowConfirmRemove(true)}><Trash2 color='white' /></button>
                    <button className='buttonIcon'><AlertCircle color={selectedPlan?.highImportance ? 'green' : 'gray'} /></button>
                    <button className='buttonIcon'><SquareArrowOutUpRight color='white' /></button>
                </div>
            }


        </div>)
}

export default SelectedStockPlanDetails