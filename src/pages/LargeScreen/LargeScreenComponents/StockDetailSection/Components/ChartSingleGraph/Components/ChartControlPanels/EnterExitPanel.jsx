import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentTool, setTool } from '../../../../../../../../features/Charting/ChartingTool'
import { PlanningTools } from '../../../../../../../../Utilities/ChartingTools'

function EnterExitPanel()
{
    const dispatch = useDispatch()
    const currentTool = useSelector(selectCurrentTool)

    return (
        <div>
            {PlanningTools.map((tool, index) => <button key={tool.tool} title={tool.tool} onClick={() => dispatch(setTool(PlanningTools[index].tool))} className={currentTool === PlanningTools[index].tool ? 'currentTool' : 'notCurrentTool'}>{tool.icon}</button>)}

        </div>
    )
}

export default EnterExitPanel