import React, { useState } from 'react'
import './MessageCenterContainer.css'
import GeneralMessages from './Components/GeneralMessages'
import PriceMessages from './Components/PriceMessages'
import FlashAlert from './Components/FlashAlert'

function MessageCenterContainer()
{
    const [messageDisplay, setMessageDisplay] = useState('general')
    const [flashAlert, setFlashAlert] = useState([])

    function provideCurrentMessageDisplay()
    {
        switch (messageDisplay)
        {
            case 'general': return <GeneralMessages />
            case 'price': return <PriceMessages />
        }
    }

    return (
        <div id='MessageCenterSection' className='newsMessageFlexDisplay'>
            <fieldset onChange={(e) => setMessageDisplay(e.target.id)} id='NewsCenterDisplayNav' className='fieldSetWithTabs'>
                <input type="radio" name="messageDisplay" id="general" defaultChecked className='hidden-radio' />
                <label htmlFor="general">General</label>

                <input type="radio" name="messageDisplay" id="price" className='hidden-radio' />
                <label htmlFor="price">Price Alerts</label>
            </fieldset>
            <div>
                <button onClick={() => setFlashAlert([{ alert: 'blah blah blah' }])}>trial flash</button>
                {flashAlert.length ? <FlashAlert setFlashAlert={setFlashAlert} /> : provideCurrentMessageDisplay()}
            </div>
        </div>
    )
}

export default MessageCenterContainer