import React, { useState } from "react";
import { defaultTimeFrames } from "../../Utilities/TimeFrames";
import { FlaskConical, LineSquiggle, Scale3D } from "lucide-react";
import { useDispatch } from "react-redux";
import { setResetXYZoomState } from "../../features/Charting/GraphHoverZoomElement";
import { setSelectedIndexTimeFrame } from "../../features/SelectedStocks/SelectedStockSlice";

function ChartTimeFrameBar({ ticker, setTimeFrame, timeFrame, subCharts, setSubCharts, uuid })
{
  const [showTimeFrameModal, setShowTimeFrameModal] = useState(false)


  const [showTimeFrameSelect, setShowTimeFrameSelect] = useState(false)
  const [showStudiesSelect, setShowStudiesSelect] = useState(false)


  function handlePreDefinedTimeSelection(e)
  {
    switch (e.target.value)
    {
      case "3D1M": setTimeFrame(defaultTimeFrames.threeDayOneMin); break;
      case "3D2M": setTimeFrame(defaultTimeFrames.threeDayTwoMin); break;
      case "3D5M": setTimeFrame(defaultTimeFrames.threeDayFiveMin); break;
      case "3D15M": setTimeFrame(defaultTimeFrames.threeDayFifteenMin); break;
      case "3D30M": setTimeFrame(defaultTimeFrames.threeDayThirtyMin); break;
      case "3D1H": setTimeFrame(defaultTimeFrames.threeDayOneHour); break;
      case "4H1Y": setTimeFrame(defaultTimeFrames.fourHourOneYear); break;
      case "1W1Y": setTimeFrame(defaultTimeFrames.weeklyOneYear); break;
      case "1D1Y": setTimeFrame(defaultTimeFrames.dailyOneYear); break;
    }
    setShowTimeFrameModal(false)
  }

  function provideTimeFrameDurationText()
  {
    if (timeFrame.unitOfDuration === 'D') return ''
    else return `:${timeFrame.duration}${timeFrame.unitOfDuration}`
  }

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

    setShowTimeFrameSelect(false)
    setTimeFrame(timeFrameSelection)
  }

  function handleStudySelectChange(e)
  {

  }

  return <nav className="ChartTimeFrameBar">

    {showTimeFrameSelect && <TimeFrameDropDown handleTimeFrameChange={handleTimeFrameChange} setShowTimeFrameSelect={setShowTimeFrameSelect} />}
    {showStudiesSelect && <StudySelectPopover handleStudySelectChange={handleStudySelectChange} setShowStudiesSelect={setShowStudiesSelect} />}
    <div className='LSH-4WayGraphHeader'>
      <h3>{ticker}</h3>
      <button className='timeFrameButton' onClick={() => { setShowTimeFrameSelect(true); setShowStudiesSelect(false) }}>{timeFrame.increment}{timeFrame.unitOfIncrement}</button>
      <button className='buttonIcon' onClick={() => { setShowTimeFrameSelect(false); setShowStudiesSelect(true) }}><FlaskConical size={18} color='white' /></button>
      <button className='buttonIcon'><LineSquiggle color='white' size={18} /></button>

      <button className='buttonIcon' onClick={() => dispatch(setResetXYZoomState({ uuid }))} ><Scale3D size={18} color='white' /></button>
    </div>

  </nav >;
}

export default ChartTimeFrameBar;
