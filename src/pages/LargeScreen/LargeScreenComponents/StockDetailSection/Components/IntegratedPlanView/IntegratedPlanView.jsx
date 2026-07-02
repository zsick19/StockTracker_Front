import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectDetailedScoreBreakDownBySymbol } from '../../../../../../features/Engine/EnginePlanApiSlice'
import './IntegratedPlanView.css'
import { ExecutionUrgencyHud } from './Components/ExecutionUrgencyHUD'
import { differenceInMinutes, isBefore, set } from 'date-fns'
import { CapitalAllocationHUD } from './Components/CapitalAllocationHUD'
import PlanStatusHUD from './Components/PlanStatusHUD'
import ProbabilityTimeLine from './Components/ExpandedViews/ProbabilityTimeLine'
import ScoreBreakDown from './Components/ExpandedViews/ScoreBreakDown'
import MacroReview from './Components/ExpandedViews/MacroReview'
import StockInfoView from './Components/ExpandedViews/StockInfoView'
import OptionsReview from './Components/ExpandedViews/OptionsReview'
import PriceLevels from './Components/ExpandedViews/PriceLevels'
import PositionSizeReview from './Components/ExpandedViews/PositionSizeReview'
import IntegratedPlanChartWrapper from './Components/IntegratedPlanChartWrapper'
import NewsReview from './Components/ExpandedViews/NewsReview'

function IntegratedPlanView({ tickerSymbol })
{
    const todayOpen = new Date()
    todayOpen.setHours(9, 30, 0, 0)
    const minutesPostOpen = differenceInMinutes(todayOpen, new Date())

    const selectedPlannedTicker = useSelector((state) => selectDetailedScoreBreakDownBySymbol(state, tickerSymbol))


    const marketOpenHour = set(new Date(), { hours: 10, minutes: 30 })
    const [timeFrameView, setTimeFrameView] = useState(isBefore(marketOpenHour, new Date()) ? 1 : 0)

    const [expandedViewSelection, setExpandedViewSelection] = useState(0)



    function provideCurrentExpandedView()
    {
        switch (expandedViewSelection)
        {
            case 0: return <ProbabilityTimeLine plan={selectedPlannedTicker} />
            case 1: return <StockInfoView plan={selectedPlannedTicker} />
            case 2: return <MacroReview plan={selectedPlannedTicker} />
            case 3: return <ScoreBreakDown plan={selectedPlannedTicker} />
            case 4: return <OptionsReview plan={selectedPlannedTicker} />
            case 5: return <PriceLevels plan={selectedPlannedTicker} />
            case 6: return <PositionSizeReview plan={selectedPlannedTicker} />
            case 7: return <NewsReview plan={selectedPlannedTicker} />
        }
    }
    console.log(selectedPlannedTicker)

    return (
        <div id='IntegratedPlanViewPage'>
            <div id='PlanChartAndActions'>
                {selectedPlannedTicker ? <IntegratedPlanChartWrapper plan={selectedPlannedTicker} timeFrameView={timeFrameView} /> : <div>Loading...</div>}
                <div>
                    <PlanStatusHUD plan={selectedPlannedTicker} />
                    <ExecutionUrgencyHud planData={selectedPlannedTicker} currentSessionMinutesPostOpen={minutesPostOpen} />
                    <CapitalAllocationHUD planData={selectedPlannedTicker} livePrice={selectedPlannedTicker.mostRecentPrice} />
                    <div>
                        <button onClick={() => setTimeFrameView(0)}>Open</button>
                        <button onClick={() => setTimeFrameView(1)}>Today</button>
                        <button onClick={() => setTimeFrameView(2)}>Historic</button>
                    </div>
                </div>
            </div>
            <div id='ExpandedPlan'>
                <div>
                    <button onClick={() => setExpandedViewSelection(0)}>Probability</button>
                    <button onClick={() => setExpandedViewSelection(6)}>Position Size</button>
                    <button onClick={() => setExpandedViewSelection(5)}>Price Levels</button>
                    <button onClick={() => setExpandedViewSelection(1)}>Info</button>
                    <button onClick={() => setExpandedViewSelection(2)}>Macro</button>
                    <button onClick={() => setExpandedViewSelection(3)}>Score</button>
                    <button onClick={() => setExpandedViewSelection(4)}>Options</button>
                    <button onClick={() => setExpandedViewSelection(7)}>News</button>
                </div>
                {provideCurrentExpandedView()}
            </div>
        </div>
    )
}

export default IntegratedPlanView