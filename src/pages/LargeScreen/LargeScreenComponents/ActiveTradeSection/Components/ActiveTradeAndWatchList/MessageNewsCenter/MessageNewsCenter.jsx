import React, { useEffect, useState } from 'react'
import './MessageNewsCenter.css'
import SectorZones from '../SubMessageNewsComponents/SectorZones/SectorZones';
import { useDispatch, useSelector } from 'react-redux';
import { selectMessageNewsDetailControl, setMessageNewsDetailState } from '../../../../../../../features/SelectedStocks/MessageNewsDetailControl';
import ExpectedMoves from '../SubMessageNewsComponents/ExpectedMoves/ExpectedMoves';
import StandardDeviationVisual from '../SubMessageNewsComponents/StandardDeviation/SDVisual';
import JournalRecord from '../SubMessageNewsComponents/JournalRecord/JournalRecord';
import WelcomeGreeting from '../SubMessageNewsComponents/WelcomeGreeting/WelcomeGreeting';
import QuickSearch from '../SubMessageNewsComponents/QuickSearch/QuickSearch';

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
            default: return <WelcomeGreeting />
        }
    }

    function provideChecked(idForCheck)
    {
        return idForCheck === currentMessageNewsDetail
    }
    return (
        <section id='MessageNewsCenterSection'>
            <fieldset onChange={(e) => dispatch(setMessageNewsDetailState(e.target.id))} id='NewsCenterDisplayNav' className='fieldSetWithTabs'>
                <input type="radio" name="messageDisplay" id="general" defaultChecked checked={provideChecked('general')} className='hidden-radio' />
                <label htmlFor="general">General</label>
                <input type="radio" name="messageDisplay" id="account" className='hidden-radio' checked={provideChecked('account')} />
                <label htmlFor="account">Account</label>
                <input type="radio" name="messageDisplay" id="tickerInfo" className='hidden-radio' checked={provideChecked('tickerInfo')} />
                <label htmlFor="tickerInfo">Ticker Info</label>
                <input type="radio" name="messageDisplay" id="macroZoneConditions" className='hidden-radio' checked={provideChecked('macroZoneConditions')} />
                <label htmlFor="macroZoneConditions">Macro</label>
                <input type="radio" name="messageDisplay" id="standardDeviation" className='hidden-radio' checked={provideChecked('standardDeviation')} />
                <label htmlFor="standardDeviation">STD</label>
                <input type="radio" name="messageDisplay" id="expectedMoves" className='hidden-radio' checked={provideChecked('expectedMoves')} />
                <label htmlFor="expectedMoves">EM</label>
                <input type="radio" name="messageDisplay" id="journalRecord" className='hidden-radio' checked={provideChecked('journalRecord')} />
                <label htmlFor="journalRecord">Journal</label>
            </fieldset>
            {provideCurrentComponent()}
        </section>
    )
}

export default MessageNewsCenter