import React from 'react'
import { AlertTools } from '../../../../../../../../Utilities/ChartingTools'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentTool, setTool } from '../../../../../../../../features/Charting/ChartingTool'

function AlertPanel()
{
  const dispatch = useDispatch()
  const currentTool = useSelector(selectCurrentTool)
  return (
    <div>

      {AlertTools.map((tool, index) => <button key={tool.tool} title={tool.tool} onClick={() => dispatch(setTool(AlertTools[index].tool))} className={currentTool === AlertTools[index].tool ? 'currentTool' : 'notCurrentTool'}>{tool.icon}</button>)}
    </div>
  )
}

export default AlertPanel