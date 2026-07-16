import React from 'react'
import { useDispatch } from 'react-redux'
import { setStockDetailStateWithTicker } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function DeepDiscountAlertHUD()
{
    const dispatch = useDispatch()

    const sample = [
        { ticker: 'ALT', window: '3mins', level: 3, spread: 2 },
        { ticker: 'ABEV', window: '3mins', level: 2, spread: 2 },
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
                {sample.map((t, i) => <div className='SingleDiscountAlert' onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 23, ticker: t.ticker }))}>
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