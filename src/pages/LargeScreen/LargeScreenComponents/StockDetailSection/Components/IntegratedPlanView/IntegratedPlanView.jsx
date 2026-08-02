import React, { useMemo, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { selectDetailedScoreBreakDownBySymbol, selectPlanForStaticDetails, useRemovePlanFromUserMutation } from '../../../../../../features/Engine/EnginePlanApiSlice'
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
import PatternReview from './Components/ExpandedViews/PatternReview'
import ChartReview from './Components/ExpandedViews/ChartReview'
import IntegratedFetchChartWrapper from '../../../../../../components/ChartSubGraph/IntegratedFetchChartWrapper'
import { setStockDetailState, setStockDetailStateWithTicker } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { preSetDailyTimes } from '../../../../../../Utilities/TimeFrames'
import { useManageTradeRecordMutation } from '../../../../../../features/Trades/TradeSliceApi'


function IntegratedPlanView({ tickerSymbol })
{
    const dispatch = useDispatch()
    const selectStaticFieldsInstance = useMemo(selectPlanForStaticDetails, [])
    const selectedPlannedTicker = useSelector((state) => selectStaticFieldsInstance(state, tickerSymbol), shallowEqual);
    const planHasOptions = selectedPlannedTicker.optionsConfig

    const [timeFrameView, setTimeFrameView] = useState(isBefore(preSetDailyTimes.firstHour, new Date()) ? 1 : 0)
    const [expandedViewSelection, setExpandedViewSelection] = useState(11)

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
            case 10: return <PatternReview plan={selectedPlannedTicker} />
            case 11: return <ChartReview plan={selectedPlannedTicker} />
        }
    }


    const [showDoubleCheckBeforeRemove, setShowDoubleCheckBeforeRemove] = useState(false)
    const [removePlanFromUser] = useRemovePlanFromUserMutation()
    async function attemptRemovePlanFromUser()
    {
        try
        {
            const results = await removePlanFromUser({ tickerSymbol: tickerSymbol, planId: selectedPlannedTicker.planConfig.planId }).unwrap()
            setTimeout(() => dispatch(setStockDetailState({ detail: 1 })), 1500)
        } catch (error)
        {
            console.log(error)
        }
    }



  





    return (
        <div id='IntegratedPlanViewPage'>
            <div id='PlanChartAndActions'>

                <IntegratedPlanChartWrapper plan={selectedPlannedTicker} timeFrameView={timeFrameView} />

                <div id='PlanActions'>
                    <PlanStatusHUD plan={selectedPlannedTicker} />
                    {showDoubleCheckBeforeRemove ?
                        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 'var(--fs-100)' }}>
                            <button onClick={() => attemptRemovePlanFromUser()}>Confirm Removal</button>
                            <button onClick={() => setShowDoubleCheckBeforeRemove(false)}>Cancel</button>
                        </div> :
                        <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 'var(--fs-100)' }}>
                            <button onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 27, ticker: tickerSymbol }))}>Record Trade</button>
                            <button onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 22, ticker: tickerSymbol }))}>Deep Discounts</button>
                            <button onClick={() => setShowDoubleCheckBeforeRemove(true)}>Remove Plan</button>
                        </div>
                    }
                </div>
            </div>
            <div id='ExpandedPlan'>
                <div>
                    <button className={expandedViewSelection === 11 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(11)}>Charts</button>
                    <button className={expandedViewSelection === 8 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(8)}>First Hour</button>
                    <button className={expandedViewSelection === 0 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(0)}>Probability</button>
                    <button className={expandedViewSelection === 6 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(6)}>Position Size</button>
                    <button className={expandedViewSelection === 9 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(9)}>Opening Cross</button>
                    <button className={expandedViewSelection === 5 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(5)}>Price Levels</button>
                    <button className={expandedViewSelection === 1 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(1)}>Company Info</button>
                    <button className={expandedViewSelection === 2 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(2)}>Macro</button>
                    <button className={expandedViewSelection === 3 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(3)}>Score</button>
                    <button className={expandedViewSelection === 4 ? 'selectedExpand optionsTab' : 'optionsTab'} onClick={() => setExpandedViewSelection(4)} disabled={!planHasOptions}> Options</button>
                    <button className={expandedViewSelection === 7 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(7)}>News</button>
                    <button className={expandedViewSelection === 10 ? 'selectedExpand' : ''} onClick={() => setExpandedViewSelection(10)}>Pattern</button>
                </div>
                {provideCurrentExpandedView()}
            </div>
        </div>
    )
}

export default IntegratedPlanView