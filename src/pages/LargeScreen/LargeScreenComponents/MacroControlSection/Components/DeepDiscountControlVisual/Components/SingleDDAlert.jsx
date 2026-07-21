import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { muteDeepDiscountWatch, unMuteDeepDiscountWatch } from '../../../../../../../features/DeepDiscountEngine/DeepDiscountLocalSlice'
import { setStockDetailStateWithTicker } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { Circle, VolumeOff } from 'lucide-react'

function SingleDDAlert({ deepDiscountAlert })
{
    const dispatch = useDispatch()
    const timerRef = useRef(null)

    function muteDeepDiscount()
    {
        dispatch(muteDeepDiscountWatch({ tickerSymbol: deepDiscountAlert.tickerSymbol }))
        if (timerRef.current) { clearTimeout(timerRef.current) }
        timerRef.current = setTimeout(() => { dispatch(unMuteDeepDiscountWatch({ tickerSymbol: deepDiscountAlert.tickerSymbol })) }, 1 * 60 * 1000)
    }
    function navigateToDeepDiscountTrade()
    {
        dispatch(setStockDetailStateWithTicker({ detail: 23, ticker: deepDiscountAlert.tickerSymbol }))
        dispatch(muteDeepDiscountWatch({ tickerSymbol: deepDiscountAlert.tickerSymbol }))
    }

    useEffect(() => { return () => { if (timerRef.current) { clearTimeout(timerRef.current) } } }, [])


    let mutedClassName = deepDiscountAlert.muted ? 'mutedAlert' : 'unmutedAlert'
    let discountLevelClassName = [undefined, 'AboveStopAlert', 'BelowStopAlert', 'MaxPainAlert']
    let possibleDiscountLevelColors = [undefined, 'blue', 'orange', 'red']
    let possibleLevels = [undefined, 'Above Stop', 'Below Stop', 'Max Pain']

    return (
        <div className={`${mutedClassName} ${discountLevelClassName[deepDiscountAlert.discountLevel]} SingleDiscountAlert`} onClick={() => navigateToDeepDiscountTrade()}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Circle size={16} color={deepDiscountAlert.moreThanOneLevel ? '' : 'white'} fill={`${possibleDiscountLevelColors[deepDiscountAlert.discountLevel]}`} />
                <p>{deepDiscountAlert.tickerSymbol}</p>
            </div>
            <p>{possibleLevels[deepDiscountAlert.discountLevel]}</p>
            <p></p>
            <p></p>
            {!deepDiscountAlert.muted && <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); muteDeepDiscount(deepDiscountAlert.tickerSymbol) }}><VolumeOff size={14} /></button>}
        </div>
    )
}

export default SingleDDAlert