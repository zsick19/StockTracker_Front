import React, { useRef } from 'react'
import { useResizeObserver } from '../../../hooks/useResizeObserver'
import '../ChartSubGraph.css'

function CorrelationSubChart({ })
{
    const YSVGWrapper = useRef()
    const YSVG = useRef()
    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const yScaleDimensions = useResizeObserver(YSVG)
    const chartDimensions = useResizeObserver(XSVG)


    return (
        <div className='SubChartContainer'>
            <div className='subChartGraph'>

                <div ref={YSVGWrapper} className='subChartWithVerticalTitle'>
                    <p>Correlation</p>
                    <svg ref={YSVG} className='subChartYAxis'>
                        <g className='y-axis' />
                    </svg>
                </div>

                <div ref={XSVGWrapper} className='subChartXAxis' >
                    <svg ref={XSVG} >
                        <g className='x-axis' />
                        <g className='crossHair'>
                            <line className='yTrace' />
                        </g>

                        <g className='correlation' />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default CorrelationSubChart