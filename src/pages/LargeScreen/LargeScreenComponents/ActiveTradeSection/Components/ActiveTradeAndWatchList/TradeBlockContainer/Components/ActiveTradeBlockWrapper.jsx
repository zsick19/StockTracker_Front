import React from 'react'
import SingleActiveTradeBlock from './SingleActiveTradeBlock'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function ActiveTradeBlockWrapper({ ids, refetch })
{
    const dispatch = useDispatch()
    return (
        <div id='LSH-ActiveTradeBlockWrapper' className='hide-scrollbar' onDoubleClick={refetch} onContextMenu={(e) => { e.preventDefault(); dispatch(setStockDetailState(18)) }}>
            {ids.map((activeTradeId) => <SingleActiveTradeBlock id={activeTradeId} key={`activeTrade${activeTradeId}`} />)}
        </div>
    )
}

export default ActiveTradeBlockWrapper