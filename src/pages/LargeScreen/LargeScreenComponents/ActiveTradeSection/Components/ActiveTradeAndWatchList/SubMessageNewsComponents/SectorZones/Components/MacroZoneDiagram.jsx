import React, { useCallback, useEffect, useRef, useState } from 'react'
import { color, scaleLinear, select, selectAll } from 'd3';
import { useResizeObserver } from '../../../../../../../../../hooks/useResizeObserver';

function MacroZoneDiagram({ zoneData, item })
{
    const conditionDiagramRef = useRef()
    const conditionDiagramWrapperRef = useRef()
    const diagramDimensions = useResizeObserver(conditionDiagramWrapperRef)
    const diagramSVG = select(conditionDiagramRef.current)

    const yScale = useCallback((priceToPixel) =>
    {
        if (!diagramDimensions) return
        const scale = scaleLinear().domain([zoneData.high, zoneData.low]).range([0, diagramDimensions.height])
        return scale(priceToPixel)
    }, [diagramDimensions, zoneData])


    useEffect(() =>
    {
        if (!diagramDimensions) return

        let lowPixel = yScale(zoneData.low)
        let midPixel = yScale(zoneData.mid)
        let highPixel = yScale(zoneData.high)
        let closePixel = yScale(zoneData.close)
        let trendPixel = yScale(zoneData.trend)

        let keyLevelSelection = diagramSVG.select('.zonePoints')

        keyLevelSelection.append('rect').attr('x', 0).attr('width', 5000).attr('fill', "url(#zoneBearish)").attr('opacity', 0.25)
            .attr('y', (d) => midPixel).attr('height', d => lowPixel - midPixel)
        keyLevelSelection.append('rect').attr('x', 0).attr('width', 5000).attr('fill', 'url(#zoneBullish)').attr('opacity', 0.25)
            .attr('y', (d) => highPixel).attr('height', d => midPixel - highPixel)

        keyLevelSelection.append('line')
            .attr('x1', 0).attr('x2', diagramDimensions.width)
            .attr('stroke', 'gray').attr('y1', midPixel).attr('y2', midPixel)

        keyLevelSelection.append('line')
            .attr('x1', 0).attr('x2', diagramDimensions.width)
            .attr('stroke', 'black').attr('y1', closePixel).attr('y2', closePixel)

        keyLevelSelection.append('line')
            .attr('x1', 0).attr('x2', diagramDimensions.width)
            .attr('stroke', 'green').attr('stroke-dasharray', '2 2')
            .attr('y1', trendPixel).attr('y2', trendPixel)

    }, [zoneData, diagramDimensions])
    useEffect(() =>
    {
        if (!diagramDimensions) return

        diagramSVG.select('.price').selectAll('line').remove()
        diagramSVG.select('.price').append('line')
            .attr('class', 'currentPrice')
            .attr('x1', 0).attr('x2', diagramDimensions.width)
            .attr('y1', yScale(item.mostRecentPrice))
            .attr('y2', yScale(item.mostRecentPrice))
            .attr('stroke-width', '4px')
            .attr('stroke', 'green')



    }, [item?.mostRecentPrice, diagramDimensions])

    return (
        <div className='MacroZoneConditionDiagramWrapper' ref={conditionDiagramWrapperRef} >
            <svg ref={conditionDiagramRef} >
                <defs>
                    <linearGradient id="zoneBearish" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="yellow" stop-opacity="1" />
                        <stop offset="80%" stop-color="yellow" stop-opacity=".75" />
                        <stop offset="100%" stop-color="red" stop-opacity="1" />
                    </linearGradient>
                    <linearGradient id="zoneBullish" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="blue" stop-opacity="1" />
                        <stop offset="90%" stop-color="yellow" stop-opacity="1" />
                        <stop offset="100%" stop-color="yellow" stop-opacity="1" />
                    </linearGradient>
                </defs>
                <g className='zonePoints' />
                <g className='price' />
            </svg>
        </div>
    )
}

export default MacroZoneDiagram