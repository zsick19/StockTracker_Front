import React, { useEffect, useState } from 'react'
import './MessageNewsCenter.css'
import SectorZones from './Components/SectorZones/SectorZones';
import { useDispatch, useSelector } from 'react-redux';
import { selectMessageNewsDetailControl, setMessageNewsDetailState } from '../../../../../../features/SelectedStocks/MessageNewsDetailControl';
import ExpectedMoves from './Components/ExpectedMoves/ExpectedMoves';
import StandardDeviationVisual from './Components/SDVisual';
import JournalRecord from './Components/JournalRecord/JournalRecord';
import WelcomeGreeting from './Components/WelcomeGreeting/WelcomeGreeting';
import QuickSearch from './Components/QuickSearch/QuickSearch';
import { TerminalTaskStatusTickerHUD } from '../../../../../../layouts/dash/TerminalTaskStatusTickerHUD';

function MessageNewsCenter()
{
    const dispatch = useDispatch()
    const currentMessageNewsDetail = useSelector(selectMessageNewsDetailControl)

    function provideCurrentComponent()
    {
        switch (currentMessageNewsDetail)
        {
            case 'macroZoneConditions': return <SectorZones />
            case 'account': return <div>Account Details here</div>
            case 'tickerInfo': return <QuickSearch />
            case 'expectedMoves': return <ExpectedMoves />
            case 'standardDeviation': return <StandardDeviationVisual />
            case 'journalRecord': return <JournalRecord />
            case 'calendar': return <div>Add Calendar input here</div>
            default: return <WelcomeGreeting />
        }
    }

    function provideChecked(idForCheck) { return idForCheck === currentMessageNewsDetail }

    const [showExpandedClock, setShowExpandedClock] = useState(false)
    return (
        <section id='MessageNewsCenterSection'>
            <fieldset onChange={(e) => dispatch(setMessageNewsDetailState(e.target.id))} id='NewsCenterDisplayNav' className='fieldSetWithTabs'>
                <input type="radio" name="messageDisplay" id="general" readOnly checked={provideChecked('general')} className='hidden-radio' />
                <label htmlFor="general">Schedule</label>
                <input type="radio" name="messageDisplay" id="account" readOnly className='hidden-radio' checked={provideChecked('account')} />
                <label htmlFor="account">Account</label>
                <input type="radio" name="messageDisplay" id="calendar" readOnly className='hidden-radio' checked={provideChecked('tickerInfo')} />
                <label htmlFor="calendar">Calendar</label>
                <input disabled type="radio" name="messageDisplay" id="macroZoneConditions" readOnly className='hidden-radio' checked={provideChecked('macroZoneConditions')} />
                <label htmlFor="macroZoneConditions">Macro</label>
                <input type="radio" name="messageDisplay" id="standardDeviation" readOnly className='hidden-radio' checked={provideChecked('standardDeviation')} />
                <label htmlFor="standardDeviation">STD</label>
                <input type="radio" name="messageDisplay" id="expectedMoves" readOnly className='hidden-radio' checked={provideChecked('expectedMoves')} />
                <label htmlFor="expectedMoves">EM</label>
                <input type="radio" name="messageDisplay" id="journalRecord" readOnly className='hidden-radio' checked={provideChecked('journalRecord')} />
                <label htmlFor="journalRecord">Journal</label>
            </fieldset>
            <div className='messageCenterContent'>
                {provideCurrentComponent()}
            </div>
            <TerminalTaskStatusTickerHUD showExpandedClock={showExpandedClock} setShowExpandedClock={setShowExpandedClock} />
        </section>
    )
}

export default MessageNewsCenter