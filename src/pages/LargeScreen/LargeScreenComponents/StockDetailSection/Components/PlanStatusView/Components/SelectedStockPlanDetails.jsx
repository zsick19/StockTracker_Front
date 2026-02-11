import { differenceInBusinessDays } from 'date-fns'
import { AlertCircle, Expand, SquareArrowOutUpRight, Trash2, Undo2 } from 'lucide-react'
import React, { useState } from 'react'
import { useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function SelectedStockPlanDetails({ selectedPlan, setSelectedPlan })
{
    const [showConfirmRemove, setShowConfirmRemove] = useState(false)
    console.log(selectedPlan)
    const dispatch = useDispatch()
    const [highImportance, setHighImportance] = useState(selectedPlan?.highImportance)
    const [removeSingleEnterExitPlan, { isLoading }] = useRemoveSingleEnterExitPlanMutation()
    const [toggleEnterExitPlanImportant, { isLoading: isLoadingToggle }] = useToggleEnterExitPlanImportantMutation()

    async function attemptRemovingPlan()
    {
        try
        {
            await removeSingleEnterExitPlan({ tickerSymbol: selectedPlan.tickerSymbol, planId: selectedPlan._id }).unwrap()
            setSelectedPlan(undefined)
        } catch (error)
        {
            console.log(error)
        }
    }

    async function attemptTogglingImportance()
    {
        try
        {
            await toggleEnterExitPlanImportant({ tickerSymbol: selectedPlan.tickerSymbol, planId: selectedPlan._id, markImportant: !highImportance }).unwrap()
            setHighImportance(prev =>
            {
                if (prev) return false
                return true
            })
        } catch (error)
        {
            console.log(error)
        }
    }

    function handleFourWaySplit()
    {

        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: selectedPlan.tickerSymbol, chartId: selectedPlan._id }))
        dispatch(setStockDetailState(0))

    }
    function handleTradeView()
    {
        dispatch(setSingleChartTickerTimeFrameChartIdPlanIdForTrade({ ticker: selectedPlan.tickerSymbol, chartId: selectedPlan._id, planId: selectedPlan._id, selectedPlan }))
        dispatch(setStockDetailState(8))
    }
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
                <p>Tracking for {selectedPlan.trackingDays} day</p>
            </div>

            <div>
                <p>Initial Price: ${selectedPlan.initialTrackingPrice.toFixed(2)}</p>
            </div>

            {showConfirmRemove ? <div>
                <button className='buttonIcon' onClick={() => attemptRemovingPlan()}><Trash2 color='red' /></button>
                <button className='buttonIcon' onClick={() => setShowConfirmRemove(false)}><Undo2 color='white' /></button>


            </div> :
                <div>
                    <button className='buttonIcon' onClick={() => setShowConfirmRemove(true)}><Trash2 color='white' /></button>
                    <button className='buttonIcon' onClick={() => attemptTogglingImportance()}><AlertCircle color={highImportance ? 'orange' : 'gray'} /></button>
                    <button className='buttonIcon' onClick={() => handleFourWaySplit()}><Expand color='white' /></button>
                    <button className='buttonIcon' onClick={() => handleTradeView()}><SquareArrowOutUpRight color='white' /></button>
                </div>
            }


        </div>)
}

export default SelectedStockPlanDetails