import React, { useEffect, useMemo, useRef } from 'react'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver';
import { line, max, scaleBand, scaleLinear, scaleTime, select, selectAll } from 'd3'
import { set } from 'date-fns';

function OpeningVolCompareChart({ baseLineVolData, upOrDown, todaysVol, peakOrBottomTime, volToPeak, isMorningUp })
{
    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const chartDimensions = useResizeObserver(XSVGWrapper)
    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }

    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        const xScale = scaleBand().domain(baseLineVolData.map((t, i) => i)).range([0, chartDimensions.width])
        const maxBaseLine = Math.max(...baseLineVolData)

        const liveMaxVol = todaysVol.length > 0 ? max(todaysVol, d => d) : 0

        const yScale = scaleLinear().domain([0, Math.max(maxBaseLine, liveMaxVol) * 1.1]).range([chartDimensions.height, 0])

        const liveVolLineGenerator = line().x((d, i) => xScale(i)).y(d => yScale(d))

        const svg = select(XSVG.current)
        svg.selectAll('.bar').remove()
        svg.selectAll('.liveLine').remove()
        svg.selectAll('line').remove()

        svg.selectAll(".bar").data(baseLineVolData).enter()
            .append("rect").attr("class", "bar")
            .attr("x", (d, i) => xScale(i))
            .attr("y", (d) => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => chartDimensions.height - yScale(d))
            .attr("fill", upOrDown ? "green" : 'red')

        svg.selectAll('liveLine').data([todaysVol]).enter()
            .append("path").attr('class', 'liveLine')
            .attr("d", (d, i) => liveVolLineGenerator(d, i))
            .attr("fill", "none").attr("stroke", "white").attr("stroke-width", 3)
            .attr('transform', `translate(${xScale.bandwidth()},0)`)
        // .attr('visibility', () => (isMorningUp && !upOrDown) ? 'visible' : 'hidden')

        svg.append('line')
            .attr('x1', 0).attr('x2', chartDimensions.width)
            .attr('y1', yScale(volToPeak)).attr('y2', yScale(volToPeak))
            .attr('stroke', () => upOrDown ? 'cyan' : 'orange')
            .attr("stroke-dasharray", '2 2')

        // Map the visual colors derived from your JavaScript logic array directly
        const xTimeScale = scaleTime().domain([set(new Date(), { hours: 9, minutes: 30 }), set(new Date(), { hours: 10, minutes: 30 })]).range([0, chartDimensions.width])

        let timePosition = xTimeScale(set(new Date(), { hours: peakOrBottomTime.hour, minutes: peakOrBottomTime.minute }))
        select(XSVG.current)
            .append('line')
            .attr('x1', timePosition).attr('x2', timePosition).attr('y1', 0).attr('y2', chartDimensions.height)
            .attr('stroke', () => upOrDown ? 'cyan' : 'orange')
            .attr("stroke-dasharray", '2 2')

    }, [chartDimensions, todaysVol, peakOrBottomTime, volToPeak])

    return (
        <div ref={XSVGWrapper} className='OpenVolCompare'>
            <svg ref={XSVG} />
        </div>
    )
}

export default OpeningVolCompareChart