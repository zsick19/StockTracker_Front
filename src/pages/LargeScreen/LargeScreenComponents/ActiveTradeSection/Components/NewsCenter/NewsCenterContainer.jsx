import React, { useState } from 'react'
import './NewsCenterContainer.css'

function NewsCenterContainer()
{
    const [newsDisplay, setNewsDisplay] = useState('details')

    function provideCurrentNewsDisplay()
    {
        switch (newsDisplay)
        {
            case 'details': return (<div>
                <p>//0 FourWay   //1 MarketSearch        </p>
                <p>  //2 Confirm Market Search        //3 Confirmed Status Page        </p>
                <p>  //4 Plan Viability         //5 Chart Single Graph        </p>
                <p>  //6 PreWatch many          //7 View All Plans        </p>
                <p>  //8 Trade Graph        </p>
                <p>//9 Trade Journal</p>
                <p>  //10 sync visual </p>
                <p>  //11 pre-watch stoploss </p>
                <p>  //12 pre-watch enter buffer   </p>
                <p>  //13 pre-watch planned        </p>
            </div>);
            case 'macro': return <div> Macro News Feed</div>
            case 'trade': return <div>Trade News</div>
            case 'pretrade': return <div>Pre Trade News</div>
        }
    }


    return (
        <div id='NewsDisplaySection' className='newsMessageFlexDisplay'>
            <fieldset onChange={(e) => setNewsDisplay(e.target.id)} id='NewsCenterDisplayNav' className='fieldSetWithTabs'>

                <input type="radio" name="newsDisplay" id="details" defaultChecked className='hidden-radio' />
                <label htmlFor="details">Detail Numbers</label>

                <input type="radio" name="newsDisplay" id="macro" className='hidden-radio' />
                <label htmlFor="macro">Macro</label>

                <input type="radio" name="newsDisplay" id="trade" className='hidden-radio' />
                <label htmlFor="trade">Trades</label>

                <input type="radio" name="newsDisplay" id="pretrade" className='hidden-radio' />
                <label htmlFor="pretrade">Pre Trades</label>

            </fieldset >
            <div>
                {provideCurrentNewsDisplay()}
            </div>
        </div >
    )
}

export default NewsCenterContainer