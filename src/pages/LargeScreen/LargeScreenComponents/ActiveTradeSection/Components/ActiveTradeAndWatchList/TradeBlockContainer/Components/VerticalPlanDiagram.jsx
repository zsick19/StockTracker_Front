import React, { useCallback, useEffect, useRef } from 'react'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'
import { scaleLinear, select } from 'd3'

function VerticalPlanDiagram({ idealPrices, currentPrice, percentOfGain, actualEnterPrice, beginTrackPrice, openPrice })
{
    const verticalSVGWrapper = useRef()
    const verticalSVG = useRef()
    const verticalDimensions = useResizeObserver(verticalSVGWrapper)

    const preCheckDim = () => { return !verticalDimensions }

    const yScale = useCallback((priceToPixel) =>
    {
        if (preCheckDim()) return
        let bufferAmount = (idealPrices[5] - idealPrices[0]) * 0.05
        const scale = scaleLinear().domain([(idealPrices[5] + bufferAmount), (idealPrices[0] - bufferAmount)]).range([0, verticalDimensions.height])
        return scale(priceToPixel)
    }, [verticalDimensions])

    const yScaleOutOf100 = useCallback((priceToPixel) =>
    {
        if (preCheck()) return
        const scale = scaleLinear().domain([-5, 105]).range([0, verticalDimensions.height])
        return scale(priceToPixel)
    }, [verticalDimensions])

    const priceSVG = select(verticalSVG.current)

    useEffect(() =>
    {
        if (preCheckDim()) return


        let shadingLevel = 0.4
        let pricePointSelection = priceSVG.select('.pricePoints')
        pricePointSelection.append('rect').attr('class', 'priceShading').attr('width', verticalDimensions.width)
            .attr('x', 0).attr('y', yScale(idealPrices[2])).attr('height', yScale(idealPrices[1]) - yScale(idealPrices[2]))
            .attr('fill', 'yellow').attr('opacity', shadingLevel)

        pricePointSelection.append('rect').attr('class', 'priceShading')
            .attr('x', 0).attr('y', yScale(idealPrices[1])).attr('width', verticalDimensions.width)
            .attr('height', (yScale(idealPrices[0]) - yScale(idealPrices[1]))).attr('fill', 'red').attr('opacity', shadingLevel)


        pricePointSelection.append('rect').attr('class', 'priceShading')
            .attr('x', 0).attr('y', yScale(idealPrices[4])).attr('width', verticalDimensions.width)
            .attr('height', (yScale(idealPrices[3]) - yScale(idealPrices[4]))).attr('fill', 'green').attr('opacity', shadingLevel)

        pricePointSelection.append('rect').attr('class', 'priceShading')
            .attr('x', 0).attr('y', yScale(idealPrices[5])).attr('width', verticalDimensions.width)
            .attr('height', (yScale(idealPrices[4]) - yScale(idealPrices[5]))).attr('fill', 'blue').attr('opacity', shadingLevel)


        // if (beginTrackPrice)
        // {
        //     priceSVG.select('.pricePoints').append('line').attr('x1', 0).attr('x2', verticalDimensions.width).attr('y1', yScale(beginTrackPrice)).attr('y2', yScale(beginTrackPrice))
        //         .attr('stroke-width', '1px')
        //         .attr('stroke', 'purple')
        //         .attr("stroke-dasharray", "2,2")
        // }

        // if (openPrice)
        // {
        //     priceSVG.select('.pricePoints').append('line').attr('x1', 0).attr('x2', verticalDimensions.width).attr('y1', yScale(openPrice)).attr('y2', yScale(openPrice))
        //         .attr('stroke-width', '1px')
        //         .attr('stroke', 'green')
        //         .attr("stroke-dasharray", "2,2")
        // }




    }, [verticalDimensions])


    useEffect(() =>
    {
        if (preCheckDim()) return

        priceSVG.select('.price').selectAll('line').remove()
        priceSVG.select('.price').append('line')
            .attr('class', 'currentPrice')
            .attr('x1', 0).attr('x2', verticalDimensions.width)
            .attr('y1', yScale(currentPrice))
            .attr('y2', yScale(currentPrice))
            .attr('stroke-width', '2px')
            .attr('stroke', 'black')

        // priceSVG.selectAll('polygon').remove()
        // priceSVG.append('polygon').attr('points', '0 0,10 10,10 -10,0 0 ').attr("transform", (d, i) => `translate(${verticalDimensions.width},${yScale(currentPrice)})`); // Dynamic scale based on index

    }, [currentPrice, verticalDimensions])


    return (
        <div className='VerticalPlanDiagram' ref={verticalSVGWrapper}>
            <svg ref={verticalSVG}>
                <g className='pricePoints' />
                <g className='price' />
                {/* <polygon points="0 0,10 10,10 -10,0 0" className='currentPriceTriangle' /> */}
            </svg>
        </div>
    )
}

export default VerticalPlanDiagram