import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectDetailedScoreBreakDownBySymbol } from '../../../../../../features/Engine/EnginePlanApiSlice'
import './IntegratedPlanView.css'
import './ActionGraph.css'
import './ExpandedViews.css'
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
import FirstHourReview from './Components/ExpandedViews/FirstHourReview'
import OpeningCrossReview from './Components/ExpandedViews/OpeningCrossReview'

function IntegratedPlanView({ tickerSymbol })
{
    const selectedPlannedTicker = useSelector((state) => selectDetailedScoreBreakDownBySymbol(state, tickerSymbol))

    const todayOpen = set(new Date(), { hours: 9, minutes: 30 })
    const minutesPostOpen = differenceInMinutes(new Date(), todayOpen)
    const marketOpenHour = set(new Date(), { hours: 10, minutes: 30 })

    const [timeFrameView, setTimeFrameView] = useState(isBefore(marketOpenHour, new Date()) ? 1 : 0)
    const [expandedViewSelection, setExpandedViewSelection] = useState(isBefore(new Date(), marketOpenHour) ? 8 : 0)

    const [scoreCardView, setScoreCardView] = useState(0)

    function provideCurrentExpandedView()
    {
        switch (expandedViewSelection)
        {
            case 0: return <ProbabilityTimeLine plan={selectedPlannedTicker} />
            case 1: return <StockInfoView plan={selectedPlannedTicker} />
            case 2: return <MacroReview plan={selectedPlannedTicker} />
            case 3: return <ScoreBreakDown plan={selectedPlannedTicker} scoreCardView={scoreCardView} setScoreCardView={setScoreCardView} />
            case 4: return <OptionsReview plan={selectedPlannedTicker} />
            case 5: return <PriceLevels plan={selectedPlannedTicker} />
            case 6: return <PositionSizeReview plan={selectedPlannedTicker} />
            case 7: return <NewsReview plan={selectedPlannedTicker} />
            case 8: return <FirstHourReview plan={selectedPlannedTicker} />
            case 9: return <OpeningCrossReview plan={selectedPlannedTicker} />
        }
    }



    return (
        <div id='IntegratedPlanViewPage'>
            <div id='PlanChartAndActions'>
                <IntegratedPlanChartWrapper plan={selectedPlannedTicker} timeFrameView={timeFrameView} />
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
                    <button className={expandedViewSelection === 8 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(8)}>First Hour</button>
                    <button className={expandedViewSelection === 0 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(0)}>Probability</button>
                    <button className={expandedViewSelection === 6 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(6)}>Position Size</button>
                    <button className={expandedViewSelection === 9 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(9)}>Opening Cross</button>
                    <button className={expandedViewSelection === 5 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(5)}>Price Levels</button>
                    <button className={expandedViewSelection === 1 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(1)}>Company Info</button>
                    <button className={expandedViewSelection === 2 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(2)}>Macro</button>
                    <button className={expandedViewSelection === 3 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(3)}>Score</button>
                    <button className={expandedViewSelection === 4 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(4)}>Options</button>
                    <button className={expandedViewSelection === 7 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(7)}>News</button>
                    <button className={expandedViewSelection === 10 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(10)}>Pattern</button>
                </div>
                {provideCurrentExpandedView()}
            </div>
        </div>
    )
}

export default IntegratedPlanView