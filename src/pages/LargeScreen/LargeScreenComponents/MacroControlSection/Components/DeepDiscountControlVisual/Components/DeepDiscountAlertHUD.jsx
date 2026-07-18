import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailStateWithTicker } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { useClearDeepDiscountEngineLiveDataMutation } from '../../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice'
import { muteDeepDiscountWatch, selectAllDeepDiscountWatches } from '../../../../../../../features/DeepDiscountEngine/DeepDiscountLocalSlice'

function DeepDiscountAlertHUD()
{
    const dispatch = useDispatch()

    const deepDiscountWatches = useSelector(selectAllDeepDiscountWatches)


    function muteDeepDiscount(ticker) { dispatch(muteDeepDiscountWatch({ tickerSymbol: ticker })) }

    return (
        <div id='DeepDiscountAlertHUD'>
            <div id='DiscountAlertHeader'>
                <p>Ticker</p>
                <p>Window</p>
                <p>Level</p>
                <p>Spread</p>
            </div>
            <div className='hide-Scrollbar' id='DiscountAlertList'>
                {deepDiscountWatches.map((t, i) => <div className={t.muted ? 'mutedAlert SingleDiscountAlert' : 'flashLevel3 SingleDiscountAlert'}
                    onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 23, ticker: t.tickerSymbol }))}>
                    <p>{t.tickerSymbol}</p>
                    {/* <p>{t.window}</p> */}
                    {/* <p>{t.level}</p> */}
                    {/* <p>{t.spread}</p> */}
                    <button onClick={(e) => { e.stopPropagation(); }} >Mute</button>
                </div>)}
            </div>
        </div>
    )
}

export default DeepDiscountAlertHUD