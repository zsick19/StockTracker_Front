import React, { useEffect, useState } from 'react'
import { useGetUsersEnterExitPlanQuery, useRemoveGroupedEnterExitPlanMutation } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import './PlanViabilityStatus.css'
import PlanGraphWrapper from './Components/PlanGraphWrapper'
import StopLossPlanWrapper from './Components/StopLossPlanWrapper'
import EnterBufferPlanWrapper from './Components/EnterBufferPlanWrapper'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'

function PlanViabilityStatus()
{
  const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersEnterExitPlanQuery()
  const [removeGroupedEnterExitPlan] = useRemoveGroupedEnterExitPlanMutation()

  const [planListToDisplay, setPlanListToDisplay] = useState(0)
  const [selectedPlansForRemoval, setSelectedPlansForRemoval] = useState([])
  const [selectedPlansForUpdate, setSelectedPlansForUpdate] = useState([])
  const [showTickersForRemoval, setShowTickersForRemoval] = useState(false)
  const [showTickersForUpdate, setShowTickersForUpdate] = useState(false)
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)


  let planDisplayContent
  if (isSuccess) { planDisplayContent = provideListToDisplay() }
  else if (isLoading) { planDisplayContent = <div>Loading..</div> }
  else if (isError) { planDisplayContent = <div>Error</div> }
  function provideListToDisplay()
  {
    switch (planListToDisplay)
    {
      case 0: return <StopLossPlanWrapper ids={data.stopLossHit.ids} watchList={planListToDisplay} selectedPlansForRemoval={selectedPlansForRemoval} handleRemovalToggle={handleRemovalToggle} selectedPlansForUpdate={selectedPlansForUpdate}
        handleUpdateToggle={handleUpdateToggle} />;
      case 1: return <EnterBufferPlanWrapper ids={data.enterBufferHit.ids} watchList={planListToDisplay} selectedPlansForRemoval={selectedPlansForRemoval} handleRemovalToggle={handleRemovalToggle} selectedPlansForUpdate={selectedPlansForUpdate}
        handleUpdateToggle={handleUpdateToggle} />;
      case 2: return <PlanGraphWrapper ids={data.plannedTickers.ids} watchList={planListToDisplay} selectedPlansForRemoval={selectedPlansForRemoval} handleRemovalToggle={handleRemovalToggle} selectedPlansForUpdate={selectedPlansForUpdate}
        handleUpdateToggle={handleUpdateToggle} />;
    }
  }

  const dispatch = useDispatch()
  async function attemptGroupRemovalOfNonViablePlans(params)
  {

    try
    {
      if (selectedPlansForRemoval.length === 0) return
      const results = await removeGroupedEnterExitPlan({ removeIds: selectedPlansForRemoval.map(t => t.id), removeTickers: selectedPlansForRemoval.map(t => t.tickerSymbol) })
      dispatch(setStockDetailState(10))
      setTimeout(() => dispatch(setStockDetailState(4)), [2000])
    } catch (error)
    {
      console.log(error)
    }
  }

  useEffect(() =>
  {
    let index = 0
    if (data.stopLossHit.ids.length < 1 && data.enterBufferHit.ids.length > 0) { index = 1 }
    else if (data.stopLossHit.ids.length < 1 && data.enterBufferHit.ids.length < 1) { index = 2 }
    setPlanListToDisplay(index)
  }, [])



  function handleRemovalToggle(tickerSymbol, id)
  {
    if (selectedPlansForRemoval.find(t => t.tickerSymbol === tickerSymbol))
    {
      setSelectedPlansForRemoval(prev => prev.filter(t => t.tickerSymbol !== tickerSymbol))
    } else
    {
      setSelectedPlansForRemoval(prev => [...prev, { tickerSymbol, id }])
    }
  }

  function handleUpdateToggle(tickerSymbol, id)
  {
    if (selectedPlansForUpdate.find(t => t.tickerSymbol === tickerSymbol))
    {
      setSelectedPlansForUpdate(prev => prev.filter(t => t.tickerSymbol !== tickerSymbol))
    } else
    {
      setSelectedPlansForUpdate(prev => [...prev, { tickerSymbol, id }])
    }
  }


  return (
    <div id='LSH-PlanViabilityStatus'>
      <div id='LSH-ViabilityActionBar'>
        <div>
          <button onClick={() => setPlanListToDisplay(0)} className={planListToDisplay === 0 ? 'selectedPlanList' : ''}>Stop Loss</button>
          <button onClick={() => setPlanListToDisplay(1)} className={planListToDisplay === 1 ? 'selectedPlanList' : ''}>Enter Buffer</button>
          <button onClick={() => setPlanListToDisplay(2)} className={planListToDisplay === 2 ? 'selectedPlanList' : ''}>All Other Plans</button>
        </div>

        <div>
          <button onClick={() => setShowTickersForRemoval(true)}>No Longer Viable</button>
          <button onClick={() => setShowTickersForUpdate(true)}>Needing Update</button>
        </div>

        {showRemoveConfirmation ?
          <div>
            <button onClick={() => { attemptGroupRemovalOfNonViablePlans(); setShowRemoveConfirmation(false) }}>Confirm</button>
            <button onClick={() => setShowRemoveConfirmation(false)}>Cancel</button>
          </div>
          : <button onClick={() => setShowRemoveConfirmation(true)}>Remove Nonviable</button>}

      </div>



      {showTickersForRemoval && <>
        <div className='LSH-ViabilityUpdateListUnderLay' onClick={() => setShowTickersForRemoval(false)}></div>
        <div className='LSH-ViabilityUpdateList'>
          <h1>No Longer Viable Plans</h1>
          {selectedPlansForRemoval.map((plan) => <div>{plan.tickerSymbol}</div>)}
          <button>Confirm Removal</button>
        </div>
      </>
      }

      {showTickersForUpdate && <><div className='LSH-ViabilityUpdateListUnderLay' onClick={() => setShowTickersForUpdate(false)}></div>
        <div className='LSH-ViabilityUpdateList'>
          <h1>Plans Needing Update</h1>
          {selectedPlansForUpdate.map((plan) => <div>{plan.tickerSymbol}</div>)}
          <button onClick={() => setShowTickersForUpdate(false)}>Begin Updating</button>
        </div></>}


      {planDisplayContent}
    </div>
  )
}

export default PlanViabilityStatus