import React from 'react'

function ChartGraph({ chartData })
{
    return (
        <div className='ChartGraph'>
            <svg className='priceAxisSVG'></svg>
            <svg className='dateAxisSVG'></svg>
        </div>
    )
}

export default ChartGraph