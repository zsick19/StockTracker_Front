import React from 'react'

function VortexSubChart({ candleData, uuid })
{
    return (
        <div className='SubChartContainer'>
            <div>Vortex</div>
            <div className='subChartGraph'>
                <svg className='subChartYAxis' />
                <svg className='subChartXAxis' />
            </div>
        </div>
    )
}

export default VortexSubChart