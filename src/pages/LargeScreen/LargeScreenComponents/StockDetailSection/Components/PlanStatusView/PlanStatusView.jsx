import React, { useMemo, useRef, useState } from 'react'
import { selectAllPlansAndCombined, useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import SinglePlanView from './Components/SinglePlanView'
import './PlanStatusView.css'
import { defaultSectors } from '../../../../../../Utilities/SectorsAndIndustries'
import SelectedStockChartBlock from './Components/SelectedStockChartBlock'
import SelectedStockPlanDetails from './Components/SelectedStockPlanDetails'
import { defaultTimeFrames } from '../../../../../../Utilities/TimeFrames'
import { subBusinessDays, subDays } from 'date-fns'
import { ChevronDown, ChevronUp } from 'lucide-react'

function PlanStatusView()
{
  const searchTicker = useRef()
  const { data: combinedData } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: (results) => ({ ...results, data: selectAllPlansAndCombined(results) }) })

  const [planFilters, setPlanFilters] = useState({ groupForDisplay: 4, sector: 'All', tickerSearch: undefined, olderThan: -1, riskLowerThan: -1, rewardGreaterThan: -1 })
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

    if (planFilters.sector !== 'All') { results = results.filter(t => t.sector === planFilters.sector) }
    if (planFilters.olderThan > 0) { results = results.filter(t => t.trackingDays === planFilters.olderThan) }
    if (planFilters.riskLowerThan > 0) { results = results.filter(t => t.plan.percents[0] <= planFilters.riskLowerThan) }
    if (planFilters.rewardGreaterThan > 0) { results = results.filter(t => t.plan.percents[3] >= planFilters.rewardGreaterThan) }

    switch (planSort.sort)
    {
      case 'ticker': results = results.sort((a, b) => { return planSort.direction ? a.tickerSymbol.localeCompare(b.tickerSymbol) : b.tickerSymbol.localeCompare(a.tickerSymbol) }); break
      case 'risk': results = results.sort((a, b) => { return planSort.direction ? a.plan.percents[0] - b.plan.percents[0] : b.plan.percents[0] - a.plan.percents[0] }); break;
      case 'reward': results = results.sort((a, b) => { return planSort.direction ? a.plan.percents[3] - b.plan.percents[3] : b.plan.percents[3] - a.plan.percents[3] }); break;
      case 'percentAway': results = results.sort((a, b) => { return planSort.direction ? a.percentFromEnter - b.percentFromEnter : b.percentFromEnter - a.percentFromEnter }); break;
      case 'sector': results = results.sort((a, b) => { return planSort.direction ? a.sector.localeCompare(b.sector) : b.sector.localeCompare(a.sector) }); break
      case 'tracking': results = results.sort((a, b) => { return planSort.direction ? a.trackingDays - b.trackingDays : b.trackingDays - a.trackingDays }); break;
      case 'importance': results = results.sort((a, b) => { return (a?.highImportance && !b?.highImportance) ? -1 : 1 }); break;
    }


    return results
  }, [planFilters, planSort, combinedData])


  const [timeFrame1, setTimeFrame1] = useState(defaultTimeFrames.dailyMonth)
  const [timeFrame2, setTimeFrame2] = useState(defaultTimeFrames.threeDayFiveMin)

  function handleTickerSearch()
  {
    if (searchTicker.current.value === '') setPlanFilters(prev => ({ ...prev, tickerSearch: undefined }))
    else setPlanFilters(prev => ({ ...prev, tickerSearch: searchTicker.current.value.toUpperCase() }))
  }
  function handleSectorChange(e)
  {
    setPlanFilters(prev => ({ ...prev, sector: e.target.value }))
  }
  function handleOlderThanChange(e)
  {
    let convertedValue = parseInt(e.target.value)
    setPlanFilters(prev => ({ ...prev, olderThan: convertedValue > 0 ? convertedValue : undefined }))
  }
  function handleRiskToRewardChange(e)
  {
    let convertedValue = parseFloat(e.target.value)
    setPlanFilters(prev => ({ ...prev, [e.target.name]: convertedValue > 0 ? convertedValue : undefined }))
  }
  function provideDirectionArrow(sortValue)
  {
    return planSort.sort === sortValue ? planSort.direction ? <ChevronUp size={16} /> : <ChevronDown size={16} /> : ''
  }


  return (
    <div id='LHS-PlanStatusView'>
      <div id='LHS-PlanStatusFilterControl'>

        <div>
          <h2>Plan Filter Status</h2>

          <form onSubmit={(e) => { e.preventDefault(); handleTickerSearch() }} className='flex'>
            <input type="text" ref={searchTicker} onChange={(e) => { if (e.target.value === '') { setPlanFilters(prev => ({ ...prev, tickerSearch: undefined })) } }} placeholder='Ticker Search' />
          </form>
          <button onClick={() => { setPlanFilters({ groupForDisplay: 4, sector: 'All', tickerSearch: undefined, olderThan: -1, riskLowerThan: -1, rewardGreaterThan: -1 }); searchTicker.current.value = '' }}>
            Clear All Filters</button>
        </div>

        <div className='flex'>
          <div>
            <label htmlFor="sectorFilter">Sector Filter</label>
            <select value={planFilters.sector} name="sector" id="sectorFilter" onChange={(e) => handleSectorChange(e)}>
              <option value="All">All Sectors</option>
              {defaultSectors.map((sector) => <option value={sector}>{sector}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sectorFilter">Tracking Days</label>
            <select name="olderThan" id="trackingDaysFilter" onChange={(e) => handleOlderThanChange(e)}>
              <option value={-1}>Any</option>
              <option value={1}>1 Day</option>
              <option value={2}>2 Days</option>
              <option value={3}>3 Days</option>
              <option value={4}>4 Days</option>
              <option value={5}>5 Days</option>
              <option value={6}>6 Days</option>
              <option value={7}>7 Days</option>
              <option value={8}>8 Days</option>
              <option value={9}>9 Days</option>
              <option value={10}>10 Days</option>
              <option value={14}>14 Days</option>
            </select>
          </div>
          <div>
            <label htmlFor="riskLowerThanFilter">Risk Lower Than</label>
            <select value={planFilters.riskLowerThan} name="riskLowerThan" id="riskLowerThanFilter" onChange={(e) => handleRiskToRewardChange(e)}>
              <option value={-1}>Any</option>
              <option value={0.5}>0.5 Percent</option>
              <option value={1}>1 Percent</option>
              <option value={1.5}>1.5 Percent</option>
              <option value={2}>2 Percent</option>
              <option value={2.5}>2.5 Percent</option>
              <option value={3}>3 Percent</option>
            </select>
          </div>
          <div>
            <label htmlFor="rewardGreaterThanFilter">Reward Greater Than</label>
            <select value={planFilters.rewardGreaterThan} name="rewardGreaterThan" id="rewardGreaterThanFilter" onChange={(e) => handleRiskToRewardChange(e)}>
              <option value={-1}>Any</option>
              <option value={1.5}>1.5 Percent</option>
              <option value={2}>2 Percent</option>
              <option value={3}>3 Percent</option>
              <option value={4}>4 Percent</option>
              <option value={5}>5 Percent</option>
              <option value={6}>6 Percent</option>
              <option value={7}>7 Percent</option>
              <option value={8}>8 Percent</option>
              <option value={9}>9 Percent</option>
              <option value={10}>10 Percent</option>
            </select>
          </div>
        </div>

        <fieldset onChange={(e) => setPlanFilters(prev => ({ ...prev, [e.target.name]: parseInt(e.target.value) }))}>
          <input type="radio" name="groupForDisplay" id="allPlansGroup" className='hiddenRadioInput' value={4} defaultChecked />
          <label htmlFor="allPlansGroup" className='clickableLabel'>All Plans</label>
          <input type="radio" name="groupForDisplay" id="highImportance" className='hiddenRadioInput' value={3} />
          <label htmlFor="highImportance" className='clickableLabel'>High Importance</label>
          <input type="radio" name="groupForDisplay" id="otherPlansGroup" className='hiddenRadioInput' value={2} />
          <label htmlFor="otherPlansGroup" className='clickableLabel'>Above Enter Buffer</label>
          <input type="radio" name="groupForDisplay" id="enterBufferHitGroup" className='hiddenRadioInput' value={1} />
          <label htmlFor="enterBufferHitGroup" className='clickableLabel'>Enter Buffer Hit</label>
          <input type="radio" name="groupForDisplay" id="stopLossHitGroup" className='hiddenRadioInput' value={0} />
          <label htmlFor="stopLossHitGroup" className='clickableLabel'>Below StopLoss</label>
        </fieldset>
      </div>

      <div id='LHS-PlanDisplays'>
        <div id='LHS-PlanColumn'>
          <p onClick={() => setPlanSort(prev => ({ sort: 'ticker', direction: !prev.direction }))}>Ticker {provideDirectionArrow('ticker')}</p>
          <p onClick={() => setPlanSort(prev => ({ sort: 'percentAway', direction: !prev.direction }))}>% Away {provideDirectionArrow('percentAway')}</p>
          <p>
            <span onClick={() => setPlanSort(prev => ({ sort: 'risk', direction: !prev.direction }))}>R {provideDirectionArrow('risk')}</span> vs <span
              onClick={() => setPlanSort(prev => ({ sort: 'reward', direction: !prev.direction }))}>R{provideDirectionArrow('reward')}</span>
          </p>
          <p onClick={() => setPlanSort(prev => ({ sort: 'sector', direction: !prev.direction }))}>$1000{provideDirectionArrow('sector')}</p>
          <p onClick={() => setPlanSort(prev => ({ sort: 'tracking', direction: !prev.direction }))}>Tracking{provideDirectionArrow('tracking')}</p>
          <p>Plan Diagram</p>
          <p onClick={() => setPlanSort(prev => ({ sort: 'importance', direction: !prev.direction }))}>Actions{provideDirectionArrow('importance')}</p>
        </div>
        <div id='LHS-PlanResults' className='hide-scrollbar'>
          {filteredSortedResults.map((plan) => <SinglePlanView key={plan.tickerSymbol} plan={plan} selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />)}
        </div>
      </div >



      {
        selectedPlan ?
          <div id='LHS-PlanDetailsAndChart'>
            < SelectedStockChartBlock ticker={selectedPlan.tickerSymbol} plan={selectedPlan} timeFrame={timeFrame1} />
            <SelectedStockChartBlock ticker={selectedPlan.tickerSymbol} plan={selectedPlan} timeFrame={timeFrame2} />
            <SelectedStockPlanDetails selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
          </div > :
          <div id='LHS-NoPlanSelected'>
            <p>Select a Plan</p>
          </div>
      }


    </div >
  )
}

export default PlanStatusView