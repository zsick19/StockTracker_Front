import React, { useState } from 'react'
import { useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import './PlanViabilityStatus.css'
import PlanGraphWrapper from './Components/PlanGraphWrapper'

function PlanViabilityStatus()
{
  const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersEnterExitPlanQuery()


  const [planListToDisplay, setPlanListToDisplay] = useState(2)
  const [selectedPlansForRemoval, setSelectedPlansForRemoval] = useState([])

  function provideListToDisplay()
  {
    switch (planListToDisplay)
    {
      case 0: return <PlanGraphWrapper ids={data.stopLossHit.ids} watchList={planListToDisplay} />;
      case 1: return <PlanGraphWrapper ids={data.enterBufferHit.ids} watchList={planListToDisplay} />;
      case 2: return <PlanGraphWrapper ids={data.plannedTickers.ids} watchList={planListToDisplay} selectedPlansForRemoval={selectedPlansForRemoval} handleRemovalToggle={handleRemovalToggle} />;

    }
  }

  let planDisplayContent
  if (isSuccess)
  {
    planDisplayContent = provideListToDisplay()
  }
  else if (isLoading) { planDisplayContent = <div>Loading..</div> }

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

  const [showTickersForRemoval, setShowTickersForRemoval] = useState(false)
  return (
    <div id='LSH-PlanViabilityStatus'>
      <div className='flex'>
        <button onClick={() => setPlanListToDisplay(0)}>Stop Loss Tickers</button>
        <button onClick={() => setPlanListToDisplay(1)}>Enter Buffer Tickers</button>
        <button onClick={() => setPlanListToDisplay(2)}>All Other Tickers</button>
        <br />
        <br />
        <button onClick={() => setShowTickersForRemoval(true)}>Show Nonviable Plans</button>
        <button>Remove Nonviable</button>
      </div>
      {showTickersForRemoval && <div id='LSH-ViabilityRemoveList'>
        {selectedPlansForRemoval.map((plan) => <div>{plan.tickerSymbol}</div>)}
        <button onClick={() => setShowTickersForRemoval(false)}>Close</button>
      </div>}
      {planDisplayContent}
    </div>
  )
}

export default PlanViabilityStatus