import React, { useEffect, useMemo, useRef } from 'react'
import { calculateHighLowTimeDistribution, calculateIntradayVolumeDistribution } from '../../../../../../../../Utilities/technicalIndicatorFunctions'
import { max, scaleBand, scaleLinear, select, selectAll } from 'd3'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'

function OpenRangeDistChart({ candleData })
{

    const results = useMemo(() => calculateHighLowTimeDistribution(candleData), [candleData])

    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const chartDimensions = useResizeObserver(XSVGWrapper)

    
    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }

    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        const xScale = scaleBand().domain(results.map(d => d.time)).range([0, chartDimensions.width])
        const yScale = scaleLinear().domain([0, max(results, d => d.lowPrintProbability) * 1.1]).range([chartDimensions.height, 0])
        const yScaleHigh = scaleLinear().domain([0, max(results, d => d.highPrintProbability) * 1.1]).range([chartDimensions.height, 0])

        const svg = select(XSVG.current)
        svg.selectAll('.bar').remove()
        svg.selectAll('.highBar').remove()
        svg.selectAll(".bar").data(results).enter()
            .append("rect").attr("class", "bar")
            .attr("x", (d) => xScale(d.time))
            .attr("y", (d) => yScale(d.lowPrintProbability))
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", (d) => chartDimensions.height - yScale(d.lowPrintProbability))
            // Map the visual colors derived from your JavaScript logic array directly
            .attr("fill", (d) => "red")
            .attr("opacity", (d) => (d.sessionZone === "MID_DAY" ? 0.3 : 0.95))
            // Subtle interactive hover state
            .on("mouseover", function () { select(this).attr("opacity", 1); })
            .on("mouseleave", function (event, d) { select(this).attr("opacity", d.sessionZone === "MID_DAY" ? 0.3 : 0.95); });


        svg.selectAll(".highBar").data(results).enter()
            .append("rect").attr("class", "highBar")
            .attr("x", (d) => xScale(d.time) + xScale.bandwidth() / 2)
            .attr("y", (d) => yScaleHigh(d.highPrintProbability))
            .attr("width", xScale.bandwidth() / 2)
            .attr("height", (d) => chartDimensions.height - yScaleHigh(d.highPrintProbability))
            // Map the visual colors derived from your JavaScript logic array directly
            .attr("fill", (d) => "green")
            .attr("opacity", (d) => (d.sessionZone === "MID_DAY" ? 0.15 : 0.95))
            // Subtle interactive hover state
            .on("mouseover", function () { select(this).attr("opacity", 1); })
            .on("mouseleave", function (event, d) { select(this).attr("opacity", d.sessionZone === "MID_DAY" ? 0.3 : 0.95); });


    }, [chartDimensions, candleData])

    return (
        <div ref={XSVGWrapper} id='VolDistChart'>
            <svg ref={XSVG} />
            <p>When Extremes are most hit</p>
        </div>
    )
}

export default OpenRangeDistChart