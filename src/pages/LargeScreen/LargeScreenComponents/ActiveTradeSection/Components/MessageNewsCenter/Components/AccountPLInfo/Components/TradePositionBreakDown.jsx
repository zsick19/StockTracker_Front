import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { ScanFace } from 'lucide-react'
import { selectExposureResults } from '../../../../../../../../../features/Engine/EnginePlanApiSlice'

function TradePositionBreakDown({ setCurrentSubSection })
{
    const dispatch = useDispatch()
    const { positionBreakDown } = useSelector(selectExposureResults)
    // console.log(positionBreakDown)

    return (
        <div>
            Position Breakdown

            <button onClick={() => dispatch(setStockDetailState(26))}><ScanFace /></button>
        </div>
    )
}

export default TradePositionBreakDown