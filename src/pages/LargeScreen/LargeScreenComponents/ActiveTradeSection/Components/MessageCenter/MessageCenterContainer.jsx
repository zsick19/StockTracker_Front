import React, { useState } from 'react'
import './MessageCenterContainer.css'

function MessageCenterContainer()
{


    const [messageDisplay, setMessageDisplay] = useState('gen')

    function provideCurrentMessageDisplay()
    {
        switch (messageDisplay)
        {
            case 'gen': return (<div>
                <p>
                    Spy Gamma Flip Line Status: Above
                </p>
                <h1>YOU ARE KILLING IT, JUST PUSH THROUGH</h1>
                <p>You don't make money if you don't sell when you're up.</p>
                <p>A win is a win, is a win, is a win.</p>
            </div>)


            default:
                break;
        }
    }

    return (
        <div id='MessageCenterSection' className='flex'>
            <fieldset onChange={(e) => setMessageDisplay(e.target.id)} id='NewsCenterDisplayNav'>
                <div>
                    <label htmlFor="gen">gen</label>
                    <input type="radio" name="newsDisplay" id="gen" defaultChecked />
                </div>

                <div>
                    <label htmlFor="priceAbove">Price Above Alerts</label>
                    <input type="radio" name="newsDisplay" id="priceAbove" />
                </div>

            </fieldset>
            {provideCurrentMessageDisplay()}
        </div>
    )
}

export default MessageCenterContainer