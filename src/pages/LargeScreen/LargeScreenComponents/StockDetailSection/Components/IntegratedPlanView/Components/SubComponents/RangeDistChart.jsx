import React, { useEffect, useMemo, useRef } from 'react'
import { calculateHighLowTimeDistribution, calculateIntradayVolumeDistribution } from '../../../../../../../../Utilities/technicalIndicatorFunctions'
import { max, scaleBand, scaleLinear, scaleTime, select, selectAll } from 'd3'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'
import { set } from 'date-fns'

function RangeDistChart({ results, currentTimeBar })
{
    const timeAddedResults = useMemo(() => results.map((t, i) => { return { ...t, sessionZone: (i > 11 && i < 68) ? 1 : 0 } }), [results])

    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const chartDimensions = useResizeObserver(XSVGWrapper)
    const marketOpenTime = set(new Date(), { hours: 9, minutes: 30 })
    const marketCloseTime = set(new Date(), { hours: 16, minutes: 0 })

    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }

    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        const xScale = scaleBand().domain(results.map((d, i) => i)).range([0, chartDimensions.width])

        const yScale = scaleLinear().domain([0, max(results, d => d.lowProb) * 1.1]).range([chartDimensions.height, 0])
        const yScaleHigh = scaleLinear().domain([0, max(results, d => d.highProb) * 1.1]).range([chartDimensions.height, 0])

        const svg = select(XSVG.current)
        svg.selectAll('.bar').remove()
        svg.selectAll('.highBar').remove()
        svg.selectAll(".bar").data(timeAddedResults).enter()
            .append("rect").attr("class", "bar")
            .attr("x", (d, i) => xScale(i))
            .attr("y", (d) => yScale(d.lowProb))
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", (d) => chartDimensions.height - yScale(d.lowProb))
            .attr("fill", (d) => "red")
            .attr("opacity", (d) => (d.sessionZone === 1 ? 0.15 : 0.95))


        svg.selectAll(".highBar").data(results).enter()
            .append("rect").attr("class", "highBar")
            .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
            .attr("y", (d) => yScaleHigh(d.highProb))
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", (d) => chartDimensions.height - yScaleHigh(d.highProb))
            .attr("fill", (d) => "green")
            .attr("opacity", (d) => (d.sessionZone === 1 ? 0.15 : 0.95))


    }, [chartDimensions, results])

    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        const xCurrentTimeScale = scaleTime().domain([marketOpenTime, marketCloseTime]).range([0, chartDimensions.width])

        const svg = select(XSVG.current)
        let xPixel = xCurrentTimeScale(currentTimeBar)

        svg.selectAll('line').remove()
        svg.append('line')
            .attr('x1', xPixel).attr('x2', xPixel)
            .attr('y1', 0).attr('y2', chartDimensions.height)
            .attr('stroke', 'white')
    }, [chartDimensions, currentTimeBar])

    return (
        <div ref={XSVGWrapper} id='VolDistChart'>
            <svg ref={XSVG} />
        </div>
    )
}

export default RangeDistChart