import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailStateWithTicker } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { ChartCandlestick, Eraser, Star, StarHalf, Undo2 } from 'lucide-react'
import { selectMostRecentPriceAndDailyChangeByTicker, selectMostRecentPriceByTicker } from '../../../../../../../features/Engine/EnginePlanApiSlice'
import { useToggleEnterExitPlanImportantMutation } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'

function SingleHighImportant({ tickerSymbol, planId })
{
    const dispatch = useDispatch()
    function handleJumpToIntegratedView() { dispatch(setStockDetailStateWithTicker({ detail: 21, ticker: tickerSymbol })) }
    function handleJumpToTradeView() { dispatch(setStockDetailStateWithTicker({ detail: 27, ticker: tickerSymbol })) }
    const mostRecentPrice = useSelector((state) => selectMostRecentPriceAndDailyChangeByTicker(state, tickerSymbol))

    const [confirmRemoval, setConfirmRemoval] = useState(false)

    const [toggleEnterExitPlanImportant] = useToggleEnterExitPlanImportantMutation()
    async function attemptToggleImportance()
    {
        try
        {
            const result = await toggleEnterExitPlanImportant({ tickerSymbol, planId, markImportant: false })
        } catch (error)
        {
            console.log(error)
        }
    }


    return (<>
        {confirmRemoval ? <div className='singleConfirmHighImportRemoval'>
            <p>Confirm Removal:</p>
            <button className='buttonIcon' onClick={() => setConfirmRemoval(false)}><Undo2 size={16} color='gold' /></button>
            <button className='buttonIcon' onClick={() => attemptToggleImportance()}><Eraser size={16} color='red' /></button>
        </div> :
            <div className='singleHighImportance' style={{ color: `${mostRecentPrice.changeFromOpen > 0 ? 'greenYellow' : mostRecentPrice.changeFromOpen === 0 ? 'white' : 'red'}` }}
                onContextMenu={(e) => { e.preventDefault(); setConfirmRemoval(true) }} onClick={() => handleJumpToIntegratedView()}>
                <p>{tickerSymbol}</p>
                <p>{mostRecentPrice.mostRecentPrice}</p>
                <p>{mostRecentPrice.changeFromOpen.toFixed(2)}</p>
                <p>{mostRecentPrice.percentChange.toFixed(2)}%</p>
                <button onClick={(e) => { e.stopPropagation(); handleJumpToTradeView() }} className='buttonIcon'> <ChartCandlestick size={16} color='green' /></button>
            </div >
        }
    </>)
}

export default SingleHighImportant