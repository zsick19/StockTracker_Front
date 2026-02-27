import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFetchUsersMacroWatchListQuery } from '../../../../../../../features/WatchList/WatchListStreamingSliceApi';
import { useResizeObserver } from '../../../../../../../hooks/useResizeObserver';
import { color, scaleLinear, select, selectAll } from 'd3';

function SingleMacroCondition({ macroTicker, zoneData })
{
    const { item } = useFetchUsersMacroWatchListQuery(undefined, { selectFromResult: ({ data }) => ({ item: data?.tickerState.entities[macroTicker] }), });

    const conditionDiagramRef = useRef()
    const conditionDiagramWrapperRef = useRef()
    const diagramDimensions = useResizeObserver(conditionDiagramWrapperRef)
    const diagramSVG = select(conditionDiagramRef.current)
    const [borderColor, setBorderColor] = useState('#000000')

    const yScale = useCallback((priceToPixel) =>
    {
        if (!diagramDimensions) return
        let bufferAmount = (zoneData.high - zoneData.low) * 0.05
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
            .attr('stroke', 'blue').attr('stroke-dasharray', '10 10')
            .attr('y1', midPixel).attr('y2', midPixel)

        keyLevelSelection.append('line')
            .attr('x1', 0).attr('x2', diagramDimensions.width)
            .attr('stroke', 'black').attr('opacity', 0.6)
            .attr('y1', closePixel).attr('y2', closePixel)
        // keyLevelSelection.append('line')
        //     .attr('x1', 0).attr('x2', diagramDimensions.width)
        //     .attr('stroke', 'gray').attr('opacity', 1).attr('stroke-dasharray', '10 10')
        //     .attr('y1', trendPixel).attr('y2', trendPixel)

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

        let pricePercentOfZone = (item.mostRecentPrice - zoneData.low) / (zoneData.high - zoneData.low)

        if (pricePercentOfZone > 0.6) { setBorderColor('green') }
        else if (0.6 > pricePercentOfZone && pricePercentOfZone > 0.40) { setBorderColor('blue') }
        else { setBorderColor('red') }


    }, [item.mostRecentPrice, diagramDimensions])
    const svgBorderStyle = {
        border: `2px solid ${borderColor}`,
    }
    const textStyle = {
        backgroundColor: borderColor,
        borderRadius: '5px'
    }

    return (
        <div className='singleMacroCondition'>
            <div className='MacroConditionDiagramWrapper' ref={conditionDiagramWrapperRef}>
                <svg ref={conditionDiagramRef} style={svgBorderStyle}>
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
            <p style={textStyle}>{item.ticker}</p>
        </div>
    )
}

export default SingleMacroCondition