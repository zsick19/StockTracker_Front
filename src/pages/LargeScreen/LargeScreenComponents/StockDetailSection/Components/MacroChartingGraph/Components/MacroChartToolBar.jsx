import React from 'react'
import { ChartingTools } from '../../../../../../../Utilities/ChartingTools'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentTool, setTool } from '../../../../../../../features/Charting/ChartingTool'

function MacroChartToolBar()
{
    const dispatch = useDispatch()

    const currentTool = useSelector(selectCurrentTool)

    return (
        <div id='MacroChartToolBar'>
            <p className='veryTinyText'>Draw</p>
            {ChartingTools.map((tool, index) =>
            {
                return <button key={tool.tool} title={tool.tool} onClick={() => dispatch(setTool(ChartingTools[index].tool))}
                    className={currentTool === ChartingTools[index].tool ? 'currentTool buttonIcon' : 'notCurrentTool buttonIcon'} >{ChartingTools[index].icon}</button>
            })}

        </div>
    )
}

export default MacroChartToolBar