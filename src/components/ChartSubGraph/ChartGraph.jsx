import React from 'react'
import { useSelector } from 'react-redux'
import { selectAllCharting } from '../../features/Charting/chartingElements'

function ChartGraph({ stockData, chartingData })
{
    const allChartingData = useSelector(selectAllCharting)
    //console.log(allChartingData)

    return (
        <div className='ChartGraph'>
            <svg className='priceAxisSVG'></svg>
            <svg className='dateAxisSVG'></svg>
        </div>
    )
}

export default ChartGraph