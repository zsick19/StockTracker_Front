import React, { useState } from 'react'
import './MessageNewsCenter.css'
import SectorZones from '../SubMessageNewsComponents/SectorZones/SectorZones';
import { useDispatch, useSelector } from 'react-redux';
import { selectMessageNewsDetailControl, setMessageNewsDetailState } from '../../../../../../../features/SelectedStocks/MessageNewsDetailControl';
import ExpectedMoves from '../SubMessageNewsComponents/ExpectedMoves/ExpectedMoves';
import StandardDeviationVisual from '../SubMessageNewsComponents/StandardDeviation/StandardDeviationVisual';
import JournalRecord from '../SubMessageNewsComponents/JournalRecord/JournalRecord';
import WelcomeGreeting from '../SubMessageNewsComponents/WelcomeGreeting/WelcomeGreeting';

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
            case 'expectedMoves': return <ExpectedMoves />
            case 'standardDeviation': return <StandardDeviationVisual />
            case 'journalRecord': return <JournalRecord />
            default: return <WelcomeGreeting />

        }
    }



    return (
        <section id='MessageNewsCenterSection'>
            <fieldset onChange={(e) => dispatch(setMessageNewsDetailState(e.target.id))} id='NewsCenterDisplayNav' className='fieldSetWithTabs'>
                <input type="radio" name="messageDisplay" id="general" defaultChecked className='hidden-radio' />
                <label htmlFor="general">General</label>
                <input type="radio" name="messageDisplay" id="account" className='hidden-radio' />
                <label htmlFor="account">Account</label>
                <input type="radio" name="messageDisplay" id="tickerInfo" className='hidden-radio' />
                <label htmlFor="tickerInfo">Ticker Info</label>
                <input type="radio" name="messageDisplay" id="macroZoneConditions" className='hidden-radio' />
                <label htmlFor="macroZoneConditions">Macro</label>
                <input type="radio" name="messageDisplay" id="expectedMoves" className='hidden-radio' />
                <label htmlFor="expectedMoves">EM</label>
                <input type="radio" name="messageDisplay" id="journalRecord" className='hidden-radio' />
                <label htmlFor="journalRecord">Journal</label>
            </fieldset>
            {provideCurrentComponent()}
        </section>
    )
}

export default MessageNewsCenter