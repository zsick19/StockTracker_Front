import React from 'react'

function MACDSubChart({ candleData, uuid })
{
    return (
        <div className='SubChartContainer'>
            <div>MACD</div>
            <div className='subChartGraph'>
                <svg className='subChartYAxis' />
                <svg className='subChartXAxis' />
            </div>
        </div>
    )
}

export default MACDSubChart