import { Binoculars, ChevronLeft, ChevronRight, Key, Plane, Save, Trash, Trash2, X } from 'lucide-react'

import './ContextMenuStyles.css'
import { ChartingToolEdits, ChartingTools } from '../../../Utilities/ChartingTools'
import { setTool } from '../../../features/Charting/ChartingTool'
import { useDispatch } from 'react-redux'
import { defaultTimeFrames } from '../../../Utilities/TimeFrames'

function ChartContextMenuContainer({ showContextMenu, setShowContextMenu, timeFrame, setTimeFrame })
{
  const dispatch = useDispatch()


  function handleTimeFrameChange(e)
  {
    let timeFrameSelection
    if (e.target.name === 'timeFrameIntra')
    {
      switch (e.target.id)
      {
        case '1m': timeFrameSelection = defaultTimeFrames.threeDayOneMin; break;
        case '2m': timeFrameSelection = defaultTimeFrames.threeDayTwoMin; break;
        case '5m': timeFrameSelection = defaultTimeFrames.threeDayFiveMin; break;
        case '15m': timeFrameSelection = defaultTimeFrames.threeDayFifteenMin; break;
        case '30m': timeFrameSelection = defaultTimeFrames.threeDayThirtyMin; break;
      }
    }
    else if (e.target.name === 'timeFrameHour') { timeFrameSelection = defaultTimeFrames.threeDayOneHour }
    else if (e.target.name === 'timeFrameDay') { timeFrameSelection = defaultTimeFrames.dailyOneYear }
    else if (e.target.name === 'timeFrameWeek') { timeFrameSelection = defaultTimeFrames.weeklyOneYear }
    setShowContextMenu({ display: false, style: undefined })
    setTimeFrame(timeFrameSelection)
  }




  return (
    <>
      <div id='ChartContextMenuOverlay' onClick={(e) => setShowContextMenu({ display: false, style: undefined })}></div>
      <div id='ChartContextMenuContainer' style={showContextMenu.style} onClick={(e) => e.stopPropagation()}>
        <div>
          <p>Tools</p>
          <div className='contextMenuTools'>
            {ChartingTools.map((tool, index) => { return <button className='buttonIcon' title={tool.tool} onClick={() => { dispatch(setTool(ChartingTools[index].tool)); setShowContextMenu({ display: false, style: undefined }) }} >{ChartingTools[index].icon}</button> })}
          </div>
        </div>
        <br />

        <div className='flex'>
          <div>
            <p>Edit</p>
            <div>{ChartingToolEdits.map((edit, index) => <button className='buttonIcon'>{edit.icon}</button>)}</div>
          </div>
          <br />
          <div>
            <p>Time Frame</p>
            <fieldset className='LSH-ContextMenuTimeFrame' onChange={(e) => handleTimeFrameChange(e)}>
              <div>
                <input type="radio" name="timeFrameIntra" id="1m" value={1} />
                <label htmlFor="1m">1M</label>
              </div>
              <div>
                <input type="radio" name="timeFrameIntra" id="2m" value={2} />
                <label htmlFor="2m">2M</label>
              </div>
              <div>
                <input type="radio" name="timeFrameIntra" id="5m" value={5} />
                <label htmlFor="5m">5M</label>
              </div>
              <div>
                <input type="radio" name="timeFrameIntra" id="15m" value={15} />
                <label htmlFor="15m">15M</label>
              </div>
              <div>
                <input type="radio" name="timeFrameIntra" id="30m" value={30} />
                <label htmlFor="30m">30M</label>
              </div>
              <div>
                <input type="radio" name="timeFrameHour" id="1H" value={1} />
                <label htmlFor="1H">1H</label>
              </div>
            </fieldset>
            <fieldset className='LSH-ContextMenuTimeFrame' onChange={(e) => handleTimeFrameChange(e)}>
              <div>
                <input type="radio" name="timeFrameDay" id="1d" value={1} />
                <label htmlFor="1d">1D</label>
              </div>
              <div>
                <input type="radio" name="timeFrameWeek" id="1w" value={1} />
                <label htmlFor="1w">1W</label>
              </div>
            </fieldset>
          </div>

        </div>
        <br />
        <div>
          <p>Display</p>
          <div className='flex'>
            <button className='iconButton'><Plane /></button>
            <button className='iconButton'><Key /></button>
          </div>
        </div>
        <br />
        <div className='flex'>
          <div>

            <p>Utility</p>
            <div className='flex'>
              <button className='iconButton'><Save /></button>
              <button className='iconButton'><Trash2 /></button>
              <button className='iconButton'><Binoculars /></button>
            </div>
          </div>
          <br />
          <div>
            <p>Navigation</p>
            <div className='flex'>
              <button className='iconButton'><ChevronLeft /></button>
              <button className='iconButton'><ChevronRight /></button>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default ChartContextMenuContainer