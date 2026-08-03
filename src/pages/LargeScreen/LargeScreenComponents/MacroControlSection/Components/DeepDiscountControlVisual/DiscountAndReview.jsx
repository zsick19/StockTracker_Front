import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectDeepDiscountByReviewedStatus } from '../../../../../../features/Engine/EnginePlanApiSlice'
import './DiscountAndReview.css'
import { setStockDetailStateWithTicker } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import DeepDiscountAlertHUD from './Components/DeepDiscountAlertHUD'
import { CircleCheck, Flag, FlagOff } from 'lucide-react'
import HighImportanceStocks from './Components/HighImportanceStocks'

function DiscountAndReview()
{
    const dispatch = useDispatch()
    const [showOnlyNonReviewed, setShowOnlyNonReviewed] = useState(true)
    const [showHighImportance, setShowHighImportance] = useState(true)

    const discountReviewStatus = useSelector(state => selectDeepDiscountByReviewedStatus(state, showOnlyNonReviewed))

    function handleNavigateToDeepDiscount(tickerSymbol) { dispatch(setStockDetailStateWithTicker({ detail: 22, ticker: tickerSymbol })) }

    function handleNavigateToIntegratedView(tickerSymbol) { dispatch(setStockDetailStateWithTicker({ detail: 22, ticker: tickerSymbol })) }
    function handleNavigateToTradeView(tickerSymbol) { dispatch(setStockDetailStateWithTicker({ detail: 22, ticker: tickerSymbol })) }


    return (
        <div id='DiscountAndReview'>
            <DeepDiscountAlertHUD />

            {showHighImportance ? <div id='HighImportanceReview'>
                <div onClick={() => setShowHighImportance(false)}>High Importance Stock</div>

                <HighImportanceStocks />

            </div> :
                <div id='DiscountReviewStatus' onClick={() => setShowHighImportance(false)}>

                    <div onContextMenu={(e) => { e.stopPropagation(); e.preventDefault(); setShowOnlyNonReviewed(prev => !prev) }}
                        className='DiscountReviewHeader' onClick={(e) => { e.stopPropagation(); setShowHighImportance(true) }}>
                        {showOnlyNonReviewed ? 'Non-Reviewed Plans' : 'All Plans'}
                    </div>

                    <div className='hide-scrollbar' id='DeepDiscountStatusList'>
                        {discountReviewStatus.map((t, i) => (<div className='singleDeepDiscountStatus' onClick={() => handleNavigateToDeepDiscount(t.id)}>
                            <p>{t.id}</p>
                            <p>{t.reviewed ? <Flag color='green' size={12} /> : <FlagOff size={12} color='red' />}</p>
                        </div>
                        ))}
                    </div>

                </div>
            }


        </div>
    )
}

export default DiscountAndReview