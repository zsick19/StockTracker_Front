import React from 'react'

function SubChartGraph()
{
    return (
        <div className='SubChartContainer'>
            <div>Title</div>
            <div className='subChartGraph'>
                <svg className='subChartYAxis' />
                <svg className='subChartXAxis' />
            </div>
        </div>
    )
}

export default SubChartGraph