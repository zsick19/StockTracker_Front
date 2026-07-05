import React, { useEffect, useMemo, useRef } from 'react'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver';
import { line, max, scaleBand, scaleLinear, select, selectAll } from 'd3'

function OpeningVolCompareChart({ baseLineVolData, upOrDown, todaysVol })
{
    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const chartDimensions = useResizeObserver(XSVGWrapper)
    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }


    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || todaysVol.length === 0) return
        const xScale = scaleBand().domain(baseLineVolData.map((t, i) => i)).range([0, chartDimensions.width])
        const maxBaseLine = Math.max(...baseLineVolData)
        const liveMaxVol = max(todaysVol, d => d)
        const yScale = scaleLinear().domain([0, Math.max(maxBaseLine, liveMaxVol) * 1.1]).range([chartDimensions.height, 0])

        const liveVolLineGenerator = line().x((d, i) => xScale(i)).y(d => yScale(d))
        const svg = select(XSVG.current)
        svg.selectAll('.bar').remove()
        svg.selectAll('.liveLine').remove()
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
            .attr("fill", "none").attr("stroke", "white").attr("stroke-width", 3);
        // Map the visual colors derived from your JavaScript logic array directly

    }, [chartDimensions, todaysVol])

    return (
        <div ref={XSVGWrapper} className='OpenVolCompare'>
            <svg ref={XSVG} />
        </div>
    )
}

export default OpeningVolCompareChart