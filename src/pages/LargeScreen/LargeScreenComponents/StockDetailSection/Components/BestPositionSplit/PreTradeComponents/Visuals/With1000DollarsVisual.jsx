import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'
import { axisBottom, axisLeft, max, min, scaleLinear, select } from 'd3'
import { sectorColors } from '../../../../../../../../Utilities/SectorsAndIndustries'

function With1000DollarsVisual({ enterExitPlans })
{

    const dollarsChart = useRef()
    const dollarChartWrapper = useRef()
    const dollarChartDimensions = useResizeObserver(dollarChartWrapper)

    const [zoomState, setZoomState] = useState(undefined)
    const [zoomStateY, setZoomStateY] = useState(undefined)



    const xScale = useMemo(() =>
    {
        if (!dollarChartDimensions) return
        let scale = scaleLinear().domain([5, -5]).range([dollarChartDimensions.width - 5, 5]);

        return scale
    }, [dollarChartDimensions, zoomStateY]);

    const yScale = useMemo(() =>
    {
        if (!dollarChartDimensions) return

        let maxReward = 1000
        let maxRisk = -1000

        if (enterExitPlans.length > 0)
        {
            maxReward = max(enterExitPlans, d => d.with1000DollarsCurrentGain)
            maxRisk = min(enterExitPlans, d => d.with1000DollarsCurrentRisk)
        }
        let extreme = maxReward > maxRisk ? maxReward : maxRisk
        let scale = scaleLinear().domain([(extreme * 1.1), (extreme * -1.1)]).range([5, dollarChartDimensions.height - 5]);

        if (zoomState)
        {
            const newZoomState = zoomState.rescaleX(scale)
            scale.domain(newZoomState.domain())
        }

        return scale
    }, [enterExitPlans, dollarChartDimensions, zoomState]);


    useEffect(() =>
    {
        if (!dollarChartDimensions) return
        const dollarChartSelection = select(dollarsChart.current)

        dollarChartSelection.select('.xAxis').attr('transform', `translate(0,${yScale(0)})`).call(axisBottom(xScale))
        dollarChartSelection.select('.yAxis').attr("transform", `translate(${xScale(0)}, 0)`).call(axisLeft(yScale))

        dollarChartSelection.select('.enterExitPlans').selectAll('.planGroups').data(enterExitPlans, d => d.tickerSymbol)
            .join(enter => createPlanGroup(enter), update => updatePlanGroup(update), remove => removePlanGroup(remove))


        function createPlanGroup(enter)
        {
            enter.each(function (d, i)
            {
                let x1Position = xScale(-d.percentFromEnter)
                let yPosition = yScale(d.with1000DollarsCurrentGain)
                let y2Position = yScale(d.with1000DollarsCurrentRisk)

                var planGroup = select(this).append('g').attr('class', 'planGroups')
                    .on('mouseenter', function (e, d) { select(this).selectAll('text').transition().duration(200).style('opacity', 1) })
                    .on('mouseleave', function (e, d) { select(this).selectAll('text').transition().duration(200).style('opacity', 0) })

                planGroup.append('line').attr('class', 'riskRewardSpread').attr('stroke', d => sectorColors[d.sector]).attr('stroke-width', 2)
                    .attr('y1', yPosition).attr('y2', y2Position).attr('x1', x1Position).attr('x2', x1Position)




                planGroup.append('text').attr('class', 'tickerGain').text(`$${d.with1000DollarsCurrentGain.toFixed(2)}`)
                    .attr('fill', 'white').attr("x", x1Position).attr("y", yPosition)
                    .attr('dx', (d) => - 16).attr('dy', -10).attr('opacity', 0)

                planGroup.append('text').attr('class', 'tickerRisk').text(`$${d.with1000DollarsCurrentRisk.toFixed(2)}`)
                    .attr('fill', 'white').attr("x", x1Position).attr("y", y2Position)
                    .attr('dx', - 24).attr('dy', 16).attr('opacity', 0)

                planGroup.append('text').attr('class', 'ticker').text(`${d.tickerSymbol}`)
                    .attr('fill', 'white').attr("x", x1Position).attr("y", yPosition)
                    .attr('dx', - 14).attr('dy', (d) => { return Math.abs((y2Position - yPosition) / 2) + 6 }).attr('opacity', 0)



                planGroup.append('circle').attr('class', 'rewardCircle')
                    .attr('cx', x1Position).attr('cy', yPosition)
                    .attr('r', 5).attr('fill', d => sectorColors[d.sector])

                planGroup.append('circle').attr('class', 'riskCircle')
                    .attr('cx', x1Position).attr('cy', y2Position)
                    .attr('r', 5).attr('fill', d => sectorColors[d.sector])
            })
        }
        function updatePlanGroup(update)
        {
            update.each(function (d, i)
            {
                let x1Position = xScale(-d.percentFromEnter)
                let yPosition = yScale(d.with1000DollarsCurrentGain)
                let y2Position = yScale(d.with1000DollarsCurrentRisk)

                const planGroup = select(this)
                planGroup.select('.riskRewardSpread')
                    .attr('y1', yPosition).attr('y2', y2Position)
                    .attr('x1', x1Position).attr('x2', x1Position)

                planGroup.select('.rewardCircle').attr('cx', x1Position).attr('cy', yPosition)
                planGroup.select('.riskCircle').attr('cx', x1Position).attr('cy', y2Position)
                planGroup.select('.tickerGain').attr("x", x1Position).attr("y", yPosition).text(`$${d.with1000DollarsCurrentGain.toFixed(2)}`)
                planGroup.select('.tickerRisk').attr("x", x1Position).attr("y", y2Position).text(`$${d.with1000DollarsCurrentRisk.toFixed(2)}`)
                planGroup.select('.ticker').attr("x", x1Position).attr("y", yPosition).attr('dy', (d) => { return Math.abs((y2Position - yPosition) / 2) + 6 })
            })
        }
        function removePlanGroup(remove)
        {
            remove.each(function (d, i) { select(this).remove() })
        }

    }, [enterExitPlans, dollarChartDimensions, zoomState, zoomStateY])

    useEffect(() =>
    {
        if (!dollarChartDimensions) return
        let width = xScale(1.5) - xScale(-1.5)

        const bestSelect = select(dollarsChart.current).select('.best')
        bestSelect
            .attr("x", xScale(-1.5))
            .attr("y", ((-dollarChartDimensions.height / 2)))
            .attr("width", width)
            .attr("height", dollarChartDimensions.height / 2 + 10)
            .attr("fill", "url(#myFadeGradient2)")
            .attr('opacity', 0.5)
            .attr("transform", "scale(1, -1)");

        const worstSelect = select(dollarsChart.current).select('.worst')
        worstSelect
            .attr("x", xScale(-1.5))
            .attr("y", -dollarChartDimensions.height - 10)
            .attr("width", width)
            .attr("height", dollarChartDimensions.height / 2 + 10)
            .attr("fill", "url(#myFadeGradientBad2)")
            .attr('opacity', 0.5)
            .attr("transform", "scale(1, -1)");

    }, [dollarChartDimensions, zoomState, zoomStateY])





    return (
        <div ref={dollarChartWrapper} className='positionChartWrapper'>
            <svg ref={dollarsChart}>
                <defs>
                    <linearGradient id="myFadeGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="steelblue" stop-opacity="0" />
                        <stop offset="50%" stop-color="green" stop-opacity="1" />
                        <stop offset="100%" stop-color="steelblue" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient id="myFadeGradientBad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="red" stop-opacity="0" />
                        <stop offset="50%" stop-color="red" stop-opacity="1" />
                        <stop offset="100%" stop-color="red" stop-opacity="0" />
                    </linearGradient>
                </defs>
                <rect className='best' />
                <rect className='worst' />
                <g className='yAxis' />
                <g className='xAxis' />
                <g className='enterExitPlans' />
            </svg>
        </div>
    )
}

export default With1000DollarsVisual