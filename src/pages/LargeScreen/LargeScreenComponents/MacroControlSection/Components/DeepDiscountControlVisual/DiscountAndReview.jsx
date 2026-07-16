import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectDeepDiscountByReviewedStatus } from '../../../../../../features/Engine/EnginePlanApiSlice'
import './DiscountAndReview.css'
import { setStockDetailStateWithTicker } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import DeepDiscountAlertHUD from './Components/DeepDiscountAlertHUD'
import { CircleCheck, FlagOff } from 'lucide-react'

function DiscountAndReview()
{
    const dispatch = useDispatch()
    const [showOnlyNonReviewed, setShowOnlyNonReviewed] = useState(true)
    const discountReviewStatus = useSelector(state => selectDeepDiscountByReviewedStatus(state, showOnlyNonReviewed))

    function handleNavigateToDeepDiscount(tickerSymbol) { dispatch(setStockDetailStateWithTicker({ detail: 22, ticker: tickerSymbol })) }


    return (
        <div id='DiscountAndReview'>
            <DeepDiscountAlertHUD />

            <div id='DiscountReviewStatus'>
                <div className='DiscountReviewHeader'>
                    <p>Ticker</p>
                    <p>Reviewed</p>
                </div>

                <div className='hide-scrollbar' id='DeepDiscountStatusList'>
                    {discountReviewStatus.map((t, i) =>
                    {
                        return <div className='singleDeepDiscountStatus' onClick={() => handleNavigateToDeepDiscount(t.id)}>
                            <p>{t.id}</p>
                            <p>{t.reviewed ? <Flag color='green' /> : <FlagOff size={12} color='red' />}</p>
                        </div>
                    })}
                </div>
            </div>
            <button onClick={() => setShowOnlyNonReviewed(prev => !prev)}>{showOnlyNonReviewed ? 'All' : 'Non-reviewed'}</button>
        </div>
    )
}

export default DiscountAndReview