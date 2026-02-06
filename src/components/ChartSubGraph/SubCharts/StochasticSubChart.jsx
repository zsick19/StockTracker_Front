import React from 'react'

function StochasticSubChart({ candleData, uuid })
{
    return (
        <div className='SubChartContainer'>
            <div>Stochastic</div>
            <div className='subChartGraph'>
                <svg className='subChartYAxis' />
                <svg className='subChartXAxis' />
            </div>
        </div>
    )
}

export default StochasticSubChart