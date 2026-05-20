import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { enterBufferSelectors, enterExitAdapter, enterExitPlannedSelectors, fiveMinSelectors, highImportanceSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery, useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation, useUpdateEnterExitCheckOffCriteriaMutation } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
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
import { AlertCircle, Info, ScanEye, Trash2 } from 'lucide-react'
import PriceAlerts from './PlanInfoDisplay/PriceAlerts'
import PlanInfo from './PlanInfoDisplay/PlanInfo'
import CriteriaCheckOff from './CriteriaCheckOff'

function ExpandedPreWatch({ id, watchList })
{

    const uuid = useMemo(() => short.generate(), [])
    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })
    function provideSelector(data)
    {
        let entityToReturn
        switch (watchList)
        {
            case 'enterBufferHit': entityToReturn = enterBufferSelectors.selectById(data.enterBufferHit, id); break
            case 'stopLossHit': entityToReturn = stopLossHitSelectors.selectById(data.stopLossHit, id); break
        }
        if (entityToReturn) return entityToReturn
        else if (!entityToReturn) entityToReturn = stopLossHitSelectors.selectById(data.stopLossHit, id)
        else if (!entityToReturn) entityToReturn = highImportanceSelectors.selectById(data.highImportance, id)
        else if (!entityToReturn) entityToReturn = enterExitPlannedSelectors.selectById(data.plannedTickers, id)
        return entityToReturn
    }

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

    const { data, isSuccess, isError, isLoading, error } = useGetStockDataUsingTimeFrameQuery({ ticker: id, timeFrame: defaultTimeFrames.dailyHalfYear, news: false })

    const [toggleEnterExitPlanImportant] = useToggleEnterExitPlanImportantMutation()
    async function attemptToToggleImportance(params)
    {
        try
        {
            const results = await toggleEnterExitPlanImportant({ tickerSymbol: plan.tickerSymbol, planId: plan._id, markImportant: true }).unwrap()
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
    let rsiContent
    let stochasticContent
    let vortexContent
    let macdContent
    if (isSuccess && plan)
    {
        dailyChartContent = <ChartWithChartingWrapper chartId={plan._id} ticker={id}
            candleData={data} uuid={uuid} timeFrame={defaultTimeFrames.dailyHalfYear}
            interactionController={{ isZoomAble: true, isInteractive: false }}
            showEMAs={true}
        />
        rsiContent = <RSISubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
        stochasticContent = <StochasticSubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
        vortexContent = <VortexSubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
        macdContent = <MACDSubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
    } else if (isLoading)
    {
        //go in a define
    }

    const [planInfoDisplay, setPlayInfoDisplay] = useState(0)
    function providePlanInfoDisplay()
    {
        switch (planInfoDisplay)
        {
            case 0: return <PriceAlerts plan={plan} />
            case 1: return <PlanInfo plan={plan} />

            default:
                break;
        }
    }

    return (
        <div id='ExpandedTinyPreWatch'>
            <div className='DailyChartWithChecks'>
                <div id='ExpandedDailyChartWrapper'>
                    <div className='ExpandedChartHeader'>
                        <h3>{id}</h3>

                        <CriteriaCheckOff attemptCriteriaUpdate={attemptCriteriaUpdate} plan={plan.checkOffCriteria} />

                        <button onClick={() => attemptToToggleImportance()}>Important</button>
                    </div>
                    {dailyChartContent}
                    <div id='ExpandedSubChartWithSpace'>
                        {macdContent}
                        {rsiContent}
                        {stochasticContent}
                        {vortexContent}
                    </div>
                </div>
            </div>

            <div className='ExpandedSecondSet'>
                <FiveMinCandleChartContainer id={id} />
                {plan ? <FiveMinSectorChartContainer sector={sectorToTicker[plan.sector]} /> : <div>
                    Error fetching plan
                </div>}
            </div>

            <div className='ExpandedPlanInfo'>
                <div>
                    <button className='buttonIcon' onClick={() => setPlayInfoDisplay(0)}><AlertCircle size={16} color='blue' /></button>
                    <button className='buttonIcon' onClick={() => setPlayInfoDisplay(1)}><Info size={16} color='red' /></button>
                </div>
                {providePlanInfoDisplay()}
                <div>
                    <button className='buttonIcon'><ScanEye color={plan?.updateNeededDate ? 'red' : 'white'} /></button>
                    <button className='buttonIcon'><Trash2 color='white' /></button>
                </div>

            </div>
        </div >
    )
}

export default ExpandedPreWatch