import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentTool, setTool } from '../../../../../../../../features/Charting/ChartingTool'
import { PlanningTools } from '../../../../../../../../Utilities/ChartingTools'
import { makeSelectEnterExitByTicker } from '../../../../../../../../features/EnterExitPlans/EnterExitGraphElement'
import { makeSelectChartingByTicker } from '../../../../../../../../features/Charting/chartingElements'

function EnterExitPanel({ ticker })
{
    const dispatch = useDispatch()
    const currentTool = useSelector(selectCurrentTool)

    const selectedEnterExitMemo = useMemo(makeSelectEnterExitByTicker, [])
    const EnterExitPlan = useSelector(state => selectedEnterExitMemo(state, ticker))

    const selectedChartingMemo = useMemo(makeSelectChartingByTicker, [])
    const charting = useSelector(state => selectedChartingMemo(state, ticker))

    const [displayEnterExit, setDisplayEnterExit] = useState(undefined)
    useEffect(() =>
    {
        if (EnterExitPlan) setDisplayEnterExit(EnterExitPlan)
        else if (charting.enterExitLines.enterBufferPrice) setDisplayEnterExit(charting.enterExitLines)
    }, [charting, EnterExitPlan])

    return (
        <div>
            {PlanningTools.map((tool, index) => <button key={tool.tool} title={tool.tool} onClick={() => dispatch(setTool(PlanningTools[index].tool))} className={currentTool === PlanningTools[index].tool ? 'currentTool' : 'notCurrentTool'}>{tool.icon}</button>)}
            {displayEnterExit ?
                <div>
                    <div className='flex'>
                        <div>
                            <p>${displayEnterExit.stopLossPrice}</p>
                            <p>Stoploss Price</p>
                            {displayEnterExit.percents[0].toFixed(2)}
                        </div>
                        <div>
                            <p>${displayEnterExit.enterPrice}</p>
                            <p>Enter Price</p>
                        </div>
                        <div>
                            <p>${displayEnterExit.enterBufferPrice}</p>
                            <p>Enter Buffer Price</p>
                            {displayEnterExit.percents[1].toFixed(2)}
                        </div>
                        <div>
                            <p>${displayEnterExit.exitBufferPrice}</p>
                            <p>Exit Buffer Price</p>
                            {displayEnterExit.percents[2].toFixed(2)}
                        </div>
                        <div>
                            <p>${displayEnterExit.exitPrice}</p>
                            <p>Exit Price</p>
                            {displayEnterExit.percents[3].toFixed(2)}
                        </div>
                        <div>
                            <p>${displayEnterExit.moonPrice}</p>
                            <p>Moon Price</p>
                            {displayEnterExit.percents[4].toFixed(2)}
                        </div>
                    </div>

                    <div>
                        <p>Risk vs Reward </p>
                        <p>{displayEnterExit.percents[0].toFixed(2)} :{displayEnterExit.percents[3].toFixed(2)}</p>
                    </div>

                    {(charting?.enterExitLines && !EnterExitPlan) && <div>Live Tracking Not Initiated for this plan
                        <button>Initiate Live Tracking</button>
                    </div>}


                </div> : <div>
                    <p>Create an Enter Exit Plan</p>
                </div>}

        </div>
    )
}

export default EnterExitPanel