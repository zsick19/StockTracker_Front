import React from 'react'

function DeepDiscountAlertHUD()
{
    const sample = [
        { ticker: 'ABC', window: '3mins', level: 3, spread: 2 },
        { ticker: 'ABC', window: '3mins', level: 2, spread: 2 },
        { ticker: 'ABC', window: '3mins', level: 1, spread: 2 },
        { ticker: 'ABC', window: '3mins', level: 3, spread: 2 },
    ]

    return (
        <div id='DeepDiscountAlertHUD'>
            <div id='DiscountAlertHeader'>
                <p>Ticker</p>
                <p>Window</p>
                <p>Level</p>
                <p>Spread</p>
            </div>
            <div className='hide-Scrollbar' id='DiscountAlertList'>
                {sample.map((t, i) => <div className='SingleDiscountAlert'>
                    <p>{t.ticker}</p>
                    <p>{t.window}</p>
                    <p>{t.level}</p>
                    <p>{t.spread}</p>
                </div>)}
            </div>
        </div>
    )
}

export default DeepDiscountAlertHUD