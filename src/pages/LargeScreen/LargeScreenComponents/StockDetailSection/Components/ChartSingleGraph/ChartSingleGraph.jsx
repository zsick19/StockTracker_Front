import React from 'react'
import { useSelector } from 'react-redux'
import { selectSingleChartStock } from '../../../../../../features/SelectedStocks/SelectedStockSlice'

function ChartSingleGraph()
{
    const selectedTicker = useSelector(selectSingleChartStock)
    return (
        <div>
            <p>Chart For Single Graph</p>
            {selectedTicker?.ticker || 'No ticker selected'}
        </div>
    )
}

export default ChartSingleGraph