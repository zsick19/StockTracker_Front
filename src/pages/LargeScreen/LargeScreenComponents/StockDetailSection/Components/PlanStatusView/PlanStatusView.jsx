import React, { useMemo, useRef, useState } from 'react'
import { selectAllPlansAndCombined, useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import SinglePlanView from './Components/SinglePlanView'
import './PlanStatusView.css'
import { defaultSectors } from '../../../../../../Utilities/SectorsAndIndustries'
import SelectedStockChartBlock from './Components/SelectedStockChartBlock'
import SelectedStockPlanDetails from './Components/SelectedStockPlanDetails'

function PlanStatusView()
{
  const searchTicker = useRef()
  const { data: combinedData } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: (results) => ({ ...results, data: selectAllPlansAndCombined(results) }) })

  const [planFilters, setPlanFilters] = useState({ groupForDisplay: 3, sector: undefined, tickerSearch: undefined })
  const [planSort, setPlanSort] = useState({ sort: undefined, direction: undefined })

  const [selectedPlan, setSelectedPlan] = useState(undefined)


  const filteredSortedResults = useMemo(() =>
  {
    if (combinedData.length === 0) return []

    if (planFilters.tickerSearch)
    {

      let tempResults = combinedData.stopLossHit.find(t => t.tickerSymbol === planFilters.tickerSearch)
      if (!tempResults) tempResults = combinedData.enterBuffer.find(t => t.tickerSymbol === planFilters.tickerSearch)
      if (!tempResults) tempResults = combinedData.allOtherPlans.find(t => t.tickerSymbol === planFilters.tickerSearch)

      if (!tempResults) return []
      else return [tempResults]
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


    switch (planSort.sort)
    {
      case 'ticker': results = results.sort((a, b) => { return planSort.direction ? a.tickerSymbol.localeCompare(b.tickerSymbol) : b.tickerSymbol.localeCompare(a.tickerSymbol) }); break
    }


    return results
  }, [planFilters, planSort])




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
          <div>
            <label htmlFor="stopLossHitGroup">Below StopLoss</label>
            <input type="radio" name="groupForDisplay" id="stopLossHitGroup" value={0} />
          </div>
          <div>
            <label htmlFor="enterBufferHitGroup">Enter Buffer Hit</label>
            <input type="radio" name="groupForDisplay" id="enterBufferHitGroup" value={1} />
          </div>
          <div>
            <label htmlFor="otherPlansGroup">Above Enter Buffer</label>
            <input type="radio" name="groupForDisplay" id="otherPlansGroup" value={2} />
          </div>
          <div>
            <label htmlFor="highImportance">High Importance</label>
            <input type="radio" name="groupForDisplay" id="highImportance" value={3} />
          </div>
          <div>
            <label htmlFor="allPlansGroup">All Plans</label>
            <input type="radio" name="groupForDisplay" id="allPlansGroup" value={4} defaultChecked />
          </div>
        </fieldset>

        <div>
          <label htmlFor="sectorFilter">Sector Filter</label>
          <select name="sector" id="sectorFilter" onChange={(e) => handleSectorChange(e)}>
            <option value="All">All Sectors</option>
            {defaultSectors.map((sector) => <option value={sector}>{sector}</option>)}
          </select>
        </div>
      </div>

      <div id='LHS-PlanDisplays'>
        <div id='LHS-PlanColumn'>
          <p onClick={() => setPlanSort(prev => ({ sort: 'ticker', direction: !prev.direction }))}>Ticker/Price</p>
          <p>Enter Price</p>
          <p><span onClick={() => setPlanSort(prev => ({ sort: 'risk', direction: !prev.direction }))}>Ri.</span> vs <span
            onClick={() => setPlanSort(prev => ({ sort: 'reward', direction: !prev.direction }))}>Re.</span></p>
          <p>Sector</p>
          <p>Tracking</p>
          <p>Plan Diagram</p>
        </div>
        <div id='LHS-PlanResults' className='hide-scrollbar'>
          {filteredSortedResults.map((plan) => <SinglePlanView key={plan.tickerSymbol} plan={plan} selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />)}
        </div>
      </div>



      {selectedPlan ?
        <div id='LHS-PlanDetailsAndChart'>
          <SelectedStockChartBlock ticker={selectedPlan.tickerSymbol} plan={selectedPlan} />

          <SelectedStockPlanDetails selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
        </div> :


        <div id='LHS-NoPlanSelected'>
          <p>Select a Plan For Details</p>
          <p>Below StopLoss: {combinedData.counts.stopLoss} Plans</p>
          <p>Enter Buffer Hit: {combinedData.counts.enterBuffer} Plans</p>
          <p>Above Enter Buffer: {combinedData.counts.allOtherPlans} Plans</p>
          <p>Total Plans: {combinedData.totalCount}</p>
        </div>
      }
    </div>
  )
}

export default PlanStatusView