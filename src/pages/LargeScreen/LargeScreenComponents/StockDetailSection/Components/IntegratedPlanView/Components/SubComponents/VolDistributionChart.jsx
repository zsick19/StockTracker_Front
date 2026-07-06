import React, { useEffect, useMemo, useRef } from 'react'
import { calculateIntradayVolumeDistribution } from '../../../../../../../../Utilities/technicalIndicatorFunctions'
import { max, rgb, scaleBand, scaleLinear, scaleTime, select, selectAll } from 'd3'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'
import { set } from 'date-fns'

function VolDistributionChart({ volDis, lowestIndexStart, currentTimeBar })
{

    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const chartDimensions = useResizeObserver(XSVGWrapper)
    const maxVol = Math.max(...volDis)


    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }
    const marketOpenTime = set(new Date(), { hours: 9, minutes: 30 })
    const marketCloseTime = set(new Date(), { hours: 16, minutes: 0 })
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return


        const xScale = scaleBand().domain(volDis.map((d, i) => i)).range([0, chartDimensions.width])
        const xCurrentTimeScale = scaleTime().domain([marketOpenTime, marketCloseTime]).range([0, chartDimensions.width])
        const yScale = scaleLinear().domain([0, maxVol * 1.1]).range([chartDimensions.height, 0])

        const svg = select(XSVG.current)

        let startPixel = xScale(lowestIndexStart)
        let endPixel = xScale(lowestIndexStart + 12)

        svg.selectAll('rect').remove()
        svg.append("rect")
            .attr("x", startPixel)             // Top-left X position
            .attr("y", 0)             // Top-left Y position
            .attr("width", endPixel - startPixel)        // Rectangle width
            .attr("height", chartDimensions.height)       // Rectangle height
            .attr("fill", rgb(99, 15, 15)) // Styling attribute
            .attr('opacity', 0.25)

        svg.selectAll('.bar').remove()
        svg.selectAll(".bar").data(volDis).enter()
            .append("rect").attr("class", "bar")
            .attr("x", (d, i) => xScale(i))
            .attr("y", (d) => yScale(d))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => chartDimensions.height - yScale(d))
            .attr("fill", (d, i) =>
            {
                let colorForFill = 'yellow'
                if (i < 12) colorForFill = 'cyan'
                else if (i >= 12 && i < 66) colorForFill = 'gray'
                return colorForFill
            })
            .attr("opacity", (d, i) => { return (i >= 12 && i < 66) ? 0.15 : 1 })

        svg.selectAll('line').remove()

    }, [chartDimensions, volDis])

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

export default VolDistributionChart