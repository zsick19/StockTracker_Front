import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import TimeFrameDropDown from '../ChartMenuDropDowns/TimeFrameDropDown'
import StudySelectPopover from '../ChartMenuDropDowns/StudySelectPopover'
import { setResetXYZoomState } from '../../features/Charting/GraphHoverZoomElement'
import { CalendarPlus, CloudMoon, EyeOff, FlaskConical, LineSquiggle, Scale3D, SquareX } from 'lucide-react'
import './ChartMenuBar.css'
import { defaultTimeFrames } from '../../Utilities/TimeFrames'
import { setGraphEMAControl } from '../../features/Charting/GraphStudiesVisualElement'
import { setFocusStartFinishDate, setToggleShowOnlyMarketHours } from '../../features/Charting/GraphMarketHourElement'
import { setToggleAllVisibility } from '../../features/Charting/ChartingVisibility'
import ChartVisibilityDropDown from '../ChartMenuDropDowns/ChartVisibilityDropDown'
import DateFocusDropDown from '../ChartMenuDropDowns/DateFocusDropDown'

function ChartMenuBar({ ticker, setTimeFrame, timeFrame, subCharts, setSubCharts, uuid })
{
    const dispatch = useDispatch()
    const [showTimeFrameSelect, setShowTimeFrameSelect] = useState(false)
    const [showStudiesSelect, setShowStudiesSelect] = useState(false)
    const [showVisibilitySelect, setShowVisibilitySelect] = useState(false)
    const [showDateFocusSelect, setShowDateFocusSelect] = useState(false)

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

    function handleStudySelectChange(subChartSubmission)
    {
        setSubCharts(subChartSubmission.sort((a, b) => a.localeCompare(b)))
    }

    return <div className="ChartMenuBarContainer">

        {showTimeFrameSelect && <TimeFrameDropDown handleTimeFrameChange={handleTimeFrameChange} setShowTimeFrameSelect={setShowTimeFrameSelect} />}
        {showStudiesSelect && <StudySelectPopover handleStudySelectChange={handleStudySelectChange} setShowStudiesSelect={setShowStudiesSelect} subCharts={subCharts} />}
        {showVisibilitySelect && <ChartVisibilityDropDown uuid={uuid} setShowVisibilitySelect={setShowVisibilitySelect} />}
        {showDateFocusSelect && <DateFocusDropDown uuid={uuid} setShowDateFocusSelect={setShowDateFocusSelect} />}

        <div className='MenuBar'>
            <h3>{ticker}</h3>
            <div className='flex'>
                <button className='timeFrameButton' onClick={() => { setShowTimeFrameSelect(prev => !prev); setShowStudiesSelect(false); setShowVisibilitySelect(false) }}>{timeFrame.increment}{timeFrame.unitOfIncrement}</button>
                {timeFrame.intraDay && <button className='iconButton' onClick={() => dispatch(setToggleShowOnlyMarketHours({ uuid }))}><CloudMoon size={18} /></button>}
            </div>

            <div className='flex'>
                <button className='buttonIcon' onClick={() => { setShowTimeFrameSelect(false); setShowVisibilitySelect(false); setShowStudiesSelect(prev => !prev) }}><FlaskConical size={18} color='white' /></button>
                {subCharts.length > 0 && <button className='buttonIcon' onClick={() => { setSubCharts([]) }}><SquareX size={18} color='white' /></button>}
            </div>

            <button className='buttonIcon' onClick={() => { setShowVisibilitySelect(false); setShowTimeFrameSelect(false); setShowVisibilitySelect(prev => !prev) }}
                onContextMenu={(e) => { e.preventDefault(); dispatch(setToggleAllVisibility({ uuid })) }}>
                <EyeOff color='white' size={18} />
            </button>

            <button className='buttonIcon' onClick={() => dispatch(setGraphEMAControl({ uuid }))}><LineSquiggle color='white' size={18} /></button>

            <button className='buttonIcon' onClick={() => setShowDateFocusSelect(prev => !prev)}
                onContextMenu={(e) => { e.preventDefault(); dispatch(setResetXYZoomState({ uuid })) }}>
                <Scale3D size={18} color='white' />
            </button>

        </div>

    </div >;



}

export default ChartMenuBar