import { X } from 'lucide-react'

import './ContextMenuStyles.css'
import { ChartingTools } from '../../../Utilities/ChartingTools'
import { setTool } from '../../../features/Charting/ChartingTool'
import { useDispatch } from 'react-redux'
import { defaultTimeFrames } from '../../../Utilities/TimeFrames'

function ChartContextMenuContainer({ showContextMenu, setShowContextMenu, timeFrame, setTimeFrame })
{
  const dispatch = useDispatch()

  return (
    <>
      <div id='ChartContextMenuOverlay' onClick={(e) => setShowContextMenu({ display: false, style: undefined })}></div>
      <div id='ChartContextMenuContainer' style={showContextMenu.style} onClick={(e) => e.stopPropagation()}>
        <div>
          {ChartingTools.map((tool, index) => { return <button title={tool.tool} onClick={() => { dispatch(setTool(ChartingTools[index].tool)); setShowContextMenu({ display: false, style: undefined }) }} >{ChartingTools[index].icon}</button> })}
        </div>
        <div>
          <button onClick={() => { setTimeFrame(defaultTimeFrames.threeDayOneMin); setShowContextMenu({ display: false, style: undefined }) }}>1M</button>
          <button onClick={() => { setTimeFrame(defaultTimeFrames.dailyOneYear); setShowContextMenu({ display: false, style: undefined }) }}>1D</button>
        </div>
        <button onClick={() => setShowContextMenu({ display: false, style: undefined })}><X /></button>

      </div>
    </>
  )
}

export default ChartContextMenuContainer