import React, { useCallback, useEffect, useRef } from 'react'
import './HorizontalPlanDiagram.css'
import { useResizeObserver } from '../../../../../../../../../hooks/useResizeObserver'
import { scaleLinear, select } from 'd3'

function HorizontalPlanDiagram({ mostRecentPrice, planPricePointObject, planPriceArray, initialTrackingPrice })
{
    const planWrapper = useRef()
    const priceSVG = useRef()
    const horizontalDimensions = useResizeObserver(planWrapper)
    const dimPreCheck = () => { return !horizontalDimensions }

    const xScale = useCallback((priceToPixel) =>
    {
        if (dimPreCheck()) return
        let scale
        let bufferPercent
        if (planPriceArray)
        {
            bufferPercent = (planPriceArray[5] - planPriceArray[0]) * 0.05
            scale = scaleLinear().domain([(planPriceArray[0] - bufferPercent), (planPriceArray[5] + bufferPercent)]).range([0, horizontalDimensions.width])
        } else
        {
            bufferPercent = (planPricePointObject.moonPrice - planPricePointObject.stopLossPrice) * 0.05
            scale = scaleLinear().domain([(planPricePointObject.stopLossPrice - bufferPercent), (planPricePointObject.moonPrice + bufferPercent)]).range([0, horizontalDimensions.width])
        }
        return scale(priceToPixel)
    }, [planPricePointObject, planPriceArray, horizontalDimensions])

    const planPriceSVG = select(priceSVG.current)
    const idealPrices = planPriceArray ? planPriceArray : [planPricePointObject.stopLossPrice, planPricePointObject.enterPrice, planPricePointObject.enterBufferPrice, planPricePointObject.exitBufferPrice, planPricePointObject.exitPrice, planPricePointObject.moonPrice]


    useEffect(() =>
    {
        if (dimPreCheck()) return
        planPriceSVG.select('.pricePoints').selectAll('.priceShading').remove()
        planPriceSVG.select('.pricePoints').selectAll('.priceShading').data([idealPrices]).join(enter => createIdealPriceLines(enter))

        function createIdealPriceLines(enter)
        {
            enter.append('rect').attr('class', 'stopLossShading priceShading')
                .attr('fill', 'red').attr('opacity', 0.45).attr('y', 0).attr('x', xScale(idealPrices[0]))
                .attr('height', horizontalDimensions.height).attr('width', (xScale(idealPrices[1]) - xScale(idealPrices[0])))

            enter.append('rect').attr('class', 'enterBufferShading priceShading')
                .attr('fill', 'yellow').attr('opacity', 0.45).attr('y', 0).attr('height', horizontalDimensions.height)
                .attr('x', xScale(idealPrices[1])).attr('width', (xScale(idealPrices[2]) - xScale(idealPrices[1])))

            enter.append('rect').attr('class', 'exitBufferShading priceShading')
                .attr('fill', 'green').attr('opacity', 0.45).attr('y', 0).attr('height', horizontalDimensions.height)
                .attr('x', xScale(idealPrices[3])).attr('width', (xScale(idealPrices[4]) - xScale(idealPrices[3])))

            enter.append('rect').attr('class', 'moonShading priceShading')
                .attr('y', 0).attr('height', horizontalDimensions.height).attr('fill', 'blue').attr('opacity', 0.45)
                .attr('x', xScale(idealPrices[4])).attr('width', (xScale(idealPrices[5]) - xScale(idealPrices[4])))
        }

        if (initialTrackingPrice !== undefined)
        {

            planPriceSVG.select('.pricePoints').selectAll('line').remove()
            planPriceSVG.select('.pricePoints').append('line')
                .attr('class', 'trackStartPrice')
                .attr('y1', 0)
                .attr('y2', horizontalDimensions.height)
                .attr('x1', xScale(initialTrackingPrice))
                .attr('x2', xScale(initialTrackingPrice))
                .attr('stroke-width', '2px')
                .attr('stroke', 'purple')
                .attr("stroke-dasharray", "2,2")
        }

    }, [planPricePointObject, planPriceArray, horizontalDimensions])

    useEffect(() =>
    {
        if (dimPreCheck()) return
        planPriceSVG.select('.price').selectAll('line').remove()
        planPriceSVG.select('.price').append('line')
            .attr('class', 'mostRecentPrice')
            .attr('y1', 0)
            .attr('y2', horizontalDimensions.height)
            .attr('x1', xScale(mostRecentPrice))
            .attr('x2', xScale(mostRecentPrice))
            .attr('stroke-width', '2px')
            .attr('stroke', 'black')


        planPriceSVG.selectAll('polygon').remove()
        planPriceSVG.append('polygon').attr('points', '0 0,-10 -10,10 -10,0 0 ').attr("transform", (d, i) => `translate(${xScale(mostRecentPrice)},${horizontalDimensions.height})`); // Dynamic scale based on index


    }, [planPricePointObject, planPriceArray, horizontalDimensions, mostRecentPrice])




    return (
        <div className='HorizontalPlanSVGWrapper' ref={planWrapper}>
            <svg ref={priceSVG}>
                <g className='pricePoints' />
                <g className='price' />
                <g className='suggestedPurchasePrice' />
            </svg>
        </div>
    )
}

export default HorizontalPlanDiagram