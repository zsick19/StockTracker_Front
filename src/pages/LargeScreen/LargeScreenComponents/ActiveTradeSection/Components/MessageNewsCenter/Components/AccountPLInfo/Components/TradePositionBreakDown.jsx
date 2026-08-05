import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { selectExposureResults } from '../../../../../../../../../features/Engine/EnginePlanApiSlice'
import SectorPieChart from './SectorBreakDown'

function TradePositionBreakDown({ setCurrentSubSection })
{
    const dispatch = useDispatch()
    const { positionBreakDown } = useSelector(selectExposureResults)
    const allZeros = Object.values(positionBreakDown).every(value => value === 0);


    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
            {allZeros ? <div style={{ width: '200px', height: '200px' }}></div> : <SectorPieChart data={positionBreakDown} width={200} height={200} />}
            <p onClick={() => dispatch(setStockDetailState(26))}>Position Sectors</p>
            <div onClick={() => dispatch(setStockDetailState(17))} style={{ display: 'flex', alignItems: 'center' }}><p style={{ fontSize: '12px', color: 'gray' }}>By Market Value</p>
            </div>
        </div>
    )
}

export default TradePositionBreakDown