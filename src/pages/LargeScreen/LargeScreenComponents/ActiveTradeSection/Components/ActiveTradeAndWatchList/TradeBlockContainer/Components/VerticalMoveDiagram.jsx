import React, { useCallback, useEffect, useRef } from 'react'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'
import { scaleLinear, select } from 'd3'

function VerticalMoveDiagram({ percentOfGain })
{
    const verticalSVGWrapper = useRef()
    const verticalSVG = useRef()
    const verticalDimensions = useResizeObserver(verticalSVGWrapper)

    const preCheckDim = () => { return !verticalDimensions }


    const yScaleOutOf100 = useCallback((priceToPixel) =>
    {
        if (preCheckDim()) return
        const scale = scaleLinear().domain([-5, 105]).range([verticalDimensions.height, 0])
        return scale(priceToPixel)
    }, [verticalDimensions])
    const percentSVG = select(verticalSVG.current)

    useEffect(() =>
    {
        if (preCheckDim()) return

        let percentageSelection = percentSVG.select('.percentMarkers')

        percentageSelection.append('line').attr('x1', 0).attr('x2', verticalDimensions.width)
            .attr('y1', () => yScaleOutOf100(50))
            .attr('y2', () => yScaleOutOf100(50))
            .attr('stroke-width', '1px')
            .attr('stroke', 'purple')
            .attr('stroke-opacity', '0.5')
            .attr('stroke-dasharray', '1px 1px')

        percentageSelection.append('line').attr('x1', 0).attr('x2', verticalDimensions.width)
            .attr('y1', () => yScaleOutOf100(25))
            .attr('y2', () => yScaleOutOf100(25))
            .attr('stroke-width', '1px')
            .attr('stroke-opacity', '0.5')
            .attr('stroke', 'purple')
            .attr('stroke-dasharray', '2px 1px')

        percentageSelection.append('line').attr('x1', 0).attr('x2', verticalDimensions.width)
            .attr('y1', () => yScaleOutOf100(75))
            .attr('y2', () => yScaleOutOf100(75))
            .attr('stroke-width', '1px')
            .attr('stroke', 'purple')
            .attr('stroke-opacity', '0.5')
            .attr('stroke-dasharray', '1px 1px')


        percentageSelection.append('rect')
            .attr('x', 0).attr('y', yScaleOutOf100(0)).attr('width', verticalDimensions.width)
            .attr('height', verticalDimensions.height - yScaleOutOf100(100)).attr('fill', 'red').attr('opacity', 1)

        percentageSelection.append('rect')
            .attr('x', 0).attr('y', 0).attr('width', verticalDimensions.width)
            .attr('height', yScaleOutOf100(100)).attr('fill', 'blue').attr('opacity', 1)

    }, [verticalDimensions])


    useEffect(() =>
    {
        if (preCheckDim()) return

        percentSVG.select('.price').selectAll('line').remove()
        percentSVG.select('.price').append('line')
            .attr('class', 'currentPrice')
            .attr('x1', 0).attr('x2', verticalDimensions.width)
            .attr('y1', yScaleOutOf100(percentOfGain))
            .attr('y2', yScaleOutOf100(percentOfGain))
            .attr('stroke-width', '2px')
            .attr('stroke', 'black')

    }, [percentOfGain, verticalDimensions])





    return (
        <div className='VerticalPlanDiagram' ref={verticalSVGWrapper}>
            <svg ref={verticalSVG}>
                <g className='percentMarkers' />
                <g className='price' />
                {/* <polygon points="0 0,10 10,10 -10,0 0" className='currentPriceTriangle' /> */}
            </svg>
        </div>
    )
}

export default VerticalMoveDiagram