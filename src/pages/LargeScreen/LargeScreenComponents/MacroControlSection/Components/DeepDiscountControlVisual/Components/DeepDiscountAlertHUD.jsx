import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailStateWithTicker } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { useClearDeepDiscountEngineLiveDataMutation } from '../../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice'
import { muteDeepDiscountWatch, selectAllDeepDiscountWatches, unMuteDeepDiscountWatch } from '../../../../../../../features/DeepDiscountEngine/DeepDiscountLocalSlice'
import { differenceInMinutes } from 'date-fns'
import SingleDDAlert from './SingleDDAlert'

function DeepDiscountAlertHUD()
{
    const dispatch = useDispatch()

    const deepDiscountWatches = useSelector(selectAllDeepDiscountWatches)
    function muteDeepDiscount(ticker)
    {
        dispatch(muteDeepDiscountWatch({ tickerSymbol: ticker }))
        setTimeout(() => { dispatch(unMuteDeepDiscountWatch({ tickerSymbol: ticker })) }, 3 * 60 * 1000)
    }


    return (
        <div id='DeepDiscountAlertHUD'>
            <div id='DiscountAlertHeader'>
                <h4>Deep Discount Alerts</h4>
            </div>
            <div className='hide-Scrollbar' id='DiscountAlertList'>
                {deepDiscountWatches.map((t, i) => <SingleDDAlert deepDiscountAlert={t} />)}
            </div>
        </div>
    )
}

export default DeepDiscountAlertHUD