import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { enterBufferSelectors, enterExitAdapter, enterExitPlannedSelectors, fiveMinSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery, useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation, useToggleEnterExitPlanUpdateNeededMutation, useToggleEnterExitPlanWatchTomorrowMutation, useUpdateEnterExitCheckOffCriteriaMutation } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import * as short from 'short-uuid'
import FiveMinCandleChartContainer from './FiveMinCandleChartContainer'
import FiveMinSectorChartContainer from './FiveMinSectorChartContainer'
import { sectorToTicker } from '../../../../../../../Utilities/SectorsAndIndustries'
import RSISubChart from '../../../../../../../components/ChartSubGraph/SubCharts/RSISubChart'
import StochasticSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/StochasticSubChart'
import VortexSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/VortexSubChart'
import MACDSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/MACDSubChart'
import { AlertCircle, ClipboardCopy, Info, Percent, PiggyBank, Plane, ScanEye, SunMoon, Trash2, Undo2 } from 'lucide-react'
import PriceAlerts from './PlanInfoDisplay/PriceAlerts'
import PlanInfo from './PlanInfoDisplay/PlanInfo'
import CriteriaCheckOff from './CriteriaCheckOff'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import RvRInfo from './PlanInfoDisplay/RvRInfo'
import PastFiveTradingDays from './PlanInfoDisplay/PastFiveTradingDays'

function ExpandedPreWatch({ id, watchList })
{
    const uuid = useMemo(() => short.generate(), [])
    const [planInfoDisplay, setPlayInfoDisplay] = useState(1)

    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })
    function provideSelector(data)
    {
        let entityToReturn = enterBufferSelectors.selectById(data.enterBufferHit, id);
        if (!entityToReturn) entityToReturn = stopLossHitSelectors.selectById(data.stopLossHit, id)
        else if (!entityToReturn) entityToReturn = enterExitPlannedSelectors.selectById(data.plannedTickers, id)
        return entityToReturn
    }
    function providePlanInfoDisplay()
    {
        switch (planInfoDisplay)
        {
            case 0: return <PriceAlerts plan={plan} />
            case 1: return <PlanInfo plan={plan} />
            case 2: return <RvRInfo plan={plan} />
            case 3: return <PastFiveTradingDays plan={plan} />
        }
    }

    const { data, isSuccess, isError, isLoading, error } = useGetStockDataUsingTimeFrameQuery({ ticker: id, timeFrame: defaultTimeFrames.dailyHalfYear, provideNews: false })


    const [updateEnterExitCheckOffCriteria] = useUpdateEnterExitCheckOffCriteriaMutation()
    async function attemptCriteriaUpdate(e)
    {
        console.log(e.target.id)
        console.log(e.target.checked)
        try
        {
            const result = await updateEnterExitCheckOffCriteria({ planId: plan._id, criteria: e.target.id, criteriaValue: e.target.checked }).unwrap()
            console.log(result)
        } catch (error)
        {
            console.log(error)
        }

    }

    const [toggleEnterExitPlanImportant] = useToggleEnterExitPlanImportantMutation()
    async function attemptToToggleImportance()
    {
        try
        {
            const results = await toggleEnterExitPlanImportant({ tickerSymbol: plan.tickerSymbol, planId: plan._id, markImportant: plan?.highImportance ? false : true }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }
    const [toggleEnterExitPlanWatchTomorrow] = useToggleEnterExitPlanWatchTomorrowMutation()
    async function attemptToToggleWatchTomorrow()
    {
        try
        {
            const results = await toggleEnterExitPlanWatchTomorrow({ tickerSymbol: plan.tickerSymbol, planId: plan._id, markTomorrow: plan?.watchForTomorrow ? false : true }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }
    const [toggleEnterExitPlanUpdateNeeded] = useToggleEnterExitPlanUpdateNeededMutation()
    async function attemptToToggleUpdateNeeded()
    {
        try
        {
            const results = await toggleEnterExitPlanUpdateNeeded({ tickerSymbol: plan.tickerSymbol, planId: plan._id, markUpdate: plan?.updateNeededDate ? false : true }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }




    const [removeSingleEnterExitPlan] = useRemoveSingleEnterExitPlanMutation()
    async function attemptToRemovePlan(params)
    {
        try
        {
            const results = await removeSingleEnterExitPlan({ tickerSymbol: plan.tickerSymbol, planId: plan._id }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }


    let dailyChartContent
    let subChartContent
    if (isSuccess && plan)
    {
        dailyChartContent = <ChartWithChartingWrapper chartId={plan._id} ticker={id}
            candleData={data} uuid={uuid} timeFrame={defaultTimeFrames.dailyHalfYear}
            interactionController={{ isZoomAble: true, isInteractive: false }}
            showEMAs={true}
        />
        subChartContent = <div id='ExpandedSubChartWithSpace'>
            <MACDSubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
            <RSISubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
            <StochasticSubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
            <VortexSubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
        </div>
    } else if (isLoading)
    {
        dailyChartContent = <GraphLoadingSpinner />
        subChartContent = <div id='ExpandedSubChartWithSpace'>
            <div>Loading</div>
            <div>Loading.</div>
            <div>Loading..</div>
            <div>Loading...</div>
        </div>
    } else if (isError)
    {
        dailyChartContent = <GraphLoadingError refetch={refetch} />
        subChartContent = <div id='ExpandedSubChartWithSpace'>
            <div>Error</div>
            <div>Error</div>
            <div>Error</div>
            <div>Error</div>
        </div>
    }

    const [showDoubleCheckDelete, setShowDoubleCheckDelete] = useState(false)
    return (
        <div id='ExpandedTinyPreWatch'>
            <div className='DailyChartWithChecks'>
                <div id='ExpandedDailyChartWrapper'>

                    <div className='ExpandedChartHeader'>
                        <h3>{id}</h3>

                        {showDoubleCheckDelete ? <div className='flex'>
                            <p>Are You Sure?</p>
                            <button className='buttonIcon' onClick={attemptToRemovePlan}><Trash2 color='red' /></button>
                            <button className='buttonIcon' onClick={() => setShowDoubleCheckDelete(false)}><Undo2 color='white' /></button>
                        </div> :
                            <>
                                <CriteriaCheckOff attemptCriteriaUpdate={attemptCriteriaUpdate} plan={plan?.checkOffCriteria} />
                                <button onClick={attemptToToggleImportance} className='buttonIcon'><Info color={plan?.highImportance ? 'orange' : 'white'} /></button>
                                <button className='buttonIcon' onClick={attemptToToggleWatchTomorrow} ><SunMoon color={plan?.watchForTomorrow ? 'orange' : 'white'} /></button>
                                <button className='buttonIcon' onClick={attemptToToggleUpdateNeeded}><ScanEye color={plan?.updateNeededDate ? 'orange' : 'white'} /></button>
                                <button className='buttonIcon' onClick={() => setShowDoubleCheckDelete(true)}><Trash2 color='white' /></button>
                            </>
                        }
                    </div>

                    {dailyChartContent}
                    {subChartContent}

                </div>
            </div>

            <div className='ExpandedSecondSet'>
                <FiveMinCandleChartContainer id={id} />
                {plan ? <FiveMinSectorChartContainer sector={sectorToTicker[plan.sector]} /> : <div>Error fetching plan</div>}
            </div>

            <div className='ExpandedPlanInfo'>
                <div className='PlanInfoButtonControl'>
                    <button className='buttonIcon' onClick={() => setPlayInfoDisplay(1)} title='Plan Diagram'><Plane size={18} color='blue' /></button>
                    <button className='buttonIcon' onClick={() => setPlayInfoDisplay(0)} title='Alerts'><AlertCircle size={18} color='blue' /></button>
                    <button className='buttonIcon' onClick={() => setPlayInfoDisplay(2)} title='$1000 Position'><PiggyBank size={18} color='blue' /></button>
                </div>
                {providePlanInfoDisplay()}
                <div className='PlanInfoButtonControl'>
                    <button className='buttonIcon' title='Past 5 Days' onClick={() => setPlayInfoDisplay(3)}><ClipboardCopy color='blue' size={18} /></button>
                    <button className='buttonIcon'><Percent color='blue' size={18} /></button>
                </div>

            </div>
        </div >
    )
}

export default ExpandedPreWatch