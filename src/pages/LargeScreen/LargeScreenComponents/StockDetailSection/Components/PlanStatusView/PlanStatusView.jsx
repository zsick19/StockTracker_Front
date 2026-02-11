import React, { useMemo, useRef, useState } from 'react'
import { selectAllPlansAndCombined, useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import SinglePlanView from './Components/SinglePlanView'
import './PlanStatusView.css'
import { defaultSectors } from '../../../../../../Utilities/SectorsAndIndustries'
import SelectedStockChartBlock from './Components/SelectedStockChartBlock'
import SelectedStockPlanDetails from './Components/SelectedStockPlanDetails'
import { defaultTimeFrames } from '../../../../../../Utilities/TimeFrames'

function PlanStatusView()
{
  const searchTicker = useRef()
  const { data: combinedData } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: (results) => ({ ...results, data: selectAllPlansAndCombined(results) }) })

  const [planFilters, setPlanFilters] = useState({ groupForDisplay: 4, sector: undefined, tickerSearch: undefined })
  const [planSort, setPlanSort] = useState({ sort: undefined, direction: undefined })

  const [selectedPlan, setSelectedPlan] = useState(undefined)

  const filteredSortedResults = useMemo(() =>
  {
    if (combinedData.length === 0) return []

    if (planFilters.tickerSearch)
    {
      let tempResults = combinedData.combined.find(t => t.tickerSymbol === planFilters.tickerSearch)
      if (!tempResults) return []
      return [tempResults]
    }


    let results
    switch (planFilters.groupForDisplay)
    {
      case 0: results = combinedData.stopLossHit; break
      case 1: results = combinedData.enterBuffer; break;
      case 2: results = combinedData.allOtherPlans; break;
      case 3: results = combinedData.highImportance; break;
      case 4: results = combinedData.combined; break;
    }

    if (planFilters.sector) { results = results.filter(t => t.sector === planFilters.sector) }

    switch (planSort.sort)
    {
      case 'ticker': results = results.sort((a, b) => { return planSort.direction ? a.tickerSymbol.localeCompare(b.tickerSymbol) : b.tickerSymbol.localeCompare(a.tickerSymbol) }); break
    }


    return results
  }, [planFilters, planSort, combinedData])


  const [timeFrame1, setTimeFrame1] = useState(defaultTimeFrames.dailyQuarter)
  const [timeFrame2, setTimeFrame2] = useState(defaultTimeFrames.threeDayFiveMin)

  function handleTickerSearch()
  {
    if (searchTicker.current.value === '') setPlanFilters(prev => ({ ...prev, tickerSearch: undefined }))
    else setPlanFilters(prev => ({ ...prev, tickerSearch: searchTicker.current.value.toUpperCase() }))
  }
  function handleSectorChange(e)
  {
    if (e.target.value === 'All') setPlanFilters(prev => ({ ...prev, sector: undefined }))
    else { setPlanFilters(prev => ({ ...prev, sector: e.target.value })) }
  }

  return (
    <div id='LHS-PlanStatusView'>
      <div id='LHS-PlanStatusFilterControl'>
        <h2>Plan Status Filters</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleTickerSearch() }}>
          <input type="text" ref={searchTicker} onChange={(e) => { if (e.target.value === '') { setPlanFilters(prev => ({ ...prev, tickerSearch: undefined })) } }} />
          <button>Search</button>
        </form>

        <fieldset onChange={(e) => setPlanFilters(prev => ({ ...prev, [e.target.name]: parseInt(e.target.value) }))}>

          <input type="radio" name="groupForDisplay" id="allPlansGroup" className='hiddenRadioInput' value={4} defaultChecked />
          <label htmlFor="allPlansGroup" className='clickableLabel'>All Plans</label>

          <input type="radio" name="groupForDisplay" id="highImportance" className='hiddenRadioInput' value={3} />
          <label htmlFor="highImportance" className='clickableLabel'>High Importance</label>

          <input type="radio" name="groupForDisplay" id="enterBufferHitGroup" className='hiddenRadioInput' value={1} />
          <label htmlFor="enterBufferHitGroup" className='clickableLabel'>Enter Buffer Hit</label>

          <input type="radio" name="groupForDisplay" id="otherPlansGroup" className='hiddenRadioInput' value={2} />
          <label htmlFor="otherPlansGroup" className='clickableLabel'>Above Enter Buffer</label>

          <input type="radio" name="groupForDisplay" id="stopLossHitGroup" className='hiddenRadioInput' value={0} />
          <label htmlFor="stopLossHitGroup" className='clickableLabel'>Below StopLoss</label>

        </fieldset>

        <div className='flex'>
          <label htmlFor="sectorFilter">Sector Filter</label>
          <select name="sector" id="sectorFilter" onChange={(e) => handleSectorChange(e)}>
            <option value="All">All Sectors</option>
            {defaultSectors.map((sector) => <option value={sector}>{sector}</option>)}
          </select>

          <div><p>older than...</p></div>
          <div><p>risk vs reward better than...</p></div>
        </div>
      </div>

      <div id='LHS-PlanDisplays'>
        <div id='LHS-PlanColumn'>
          <p onClick={() => setPlanSort(prev => ({ sort: 'ticker', direction: !prev.direction }))}>Ticker</p>
          <p>Current</p>
          <p><span onClick={() => setPlanSort(prev => ({ sort: 'risk', direction: !prev.direction }))}>R</span> vs <span
            onClick={() => setPlanSort(prev => ({ sort: 'reward', direction: !prev.direction }))}>R</span></p>
          <p>Sector</p>
          <p>Tracking</p>
          <p>Plan Diagram</p>
          <p>Actions</p>
        </div>
        <div id='LHS-PlanResults' className='hide-scrollbar'>
          {filteredSortedResults.map((plan) => <SinglePlanView key={plan.tickerSymbol} plan={plan} selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />)}
        </div>
      </div>



      {selectedPlan ?
        <div id='LHS-PlanDetailsAndChart'>
          <SelectedStockChartBlock ticker={selectedPlan.tickerSymbol} plan={selectedPlan} timeFrame={timeFrame1} />
          <SelectedStockChartBlock ticker={selectedPlan.tickerSymbol} plan={selectedPlan} timeFrame={timeFrame2} />
          <SelectedStockPlanDetails selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
        </div> :
        <div id='LHS-NoPlanSelected'>
          <p>Select a Plan For Details</p>
        </div>}


    </div>
  )
}

export default PlanStatusView