import { axisBottom, axisLeft, max, scaleLinear, select, zoom, zoomTransform } from 'd3'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'
import { sectorColors } from '../../../../../../../../Utilities/SectorsAndIndustries'

function RiskToRewardPercentFromEnter({ enterExitPlans })
{
    const rvrChartWrapper = useRef()
    const rvrChart = useRef()
    const rvrChartDimensions = useResizeObserver(rvrChartWrapper)

    const [zoomState, setZoomState] = useState(undefined)
    const [zoomStateY, setZoomStateY] = useState(undefined)

    const xScale = useMemo(() =>
    {
        if (!rvrChartDimensions) return
        const maxRisk = max(enterExitPlans, d => Math.abs(d.currentRiskVReward.risk))
        const maxReward = max(enterExitPlans, d => Math.abs(d.currentRiskVReward.reward))
        let centerSplit = maxRisk > maxReward ? maxReward : maxRisk

        let scale = scaleLinear().domain([(centerSplit * -1.1), (centerSplit * 1.1)]).range([5, rvrChartDimensions.width - 5]);

        if (zoomState)
        {
            const newZoomState = zoomState.rescaleX(scale)
            scale.domain(newZoomState.domain())
        }

        return scale
    }, [enterExitPlans, rvrChartDimensions, zoomState]);

    const yScale = useMemo(() =>
    {
        if (!rvrChartDimensions) return
        let scale = scaleLinear().domain([-3, 3]).range([rvrChartDimensions.height - 5, 5]);

        return scale
    }, [rvrChartDimensions, zoomStateY]);


    useEffect(() =>
    {
        if (!rvrChartDimensions) return
        const rvrChartSelection = select(rvrChart.current)

        rvrChartSelection.select('.xAxis').attr('transform', `translate(0,${yScale(0)})`).call(axisBottom(xScale))
        rvrChartSelection.select('.yAxis').attr("transform", `translate(${xScale(0)}, 0)`).call(axisLeft(yScale))

        rvrChartSelection.select('.enterExitPlans').selectAll('.planGroups').data(enterExitPlans, d => d.tickerSymbol)
            .join(enter => createPlanGroup(enter), update => updatePlanGroup(update), remove => removePlanGroup(remove))

        function createPlanGroup(enter)
        {
            enter.each(function (d, i)
            {
                var planGroup = select(this).append('g').attr('class', 'planGroups')
                    .on('mouseenter', function (e, d) { select(this).selectAll('text').transition().duration(200).style('opacity', 1) })
                    .on('mouseleave', function (e, d) { select(this).selectAll('text').transition().duration(200).style('opacity', 0) })
                let yPosition = yScale(-d.percentFromEnter)
                let x1Position = xScale(-d.currentRiskVReward.risk)
                let x2Position = xScale(d.currentRiskVReward.reward)

                planGroup.append('text').attr('class', 'ticker').text(d.tickerSymbol)
                    .attr('dy', -10).attr('fill', 'white').attr('opacity', 0)
                    .attr("x", x1Position).attr("y", yPosition)
                    .attr('dx', (d) => { return ((x2Position - x1Position) / 2) - 16 })

                planGroup.append('text').attr('class', 'risk').text(`-${d.currentRiskVReward.risk.toFixed(2)}`)
                    .attr('dx', -35).attr('dy', 5).attr('fill', 'white').attr('opacity', 0)
                    .attr('x', x1Position).attr('y', yPosition)
                planGroup.append('text').attr('class', 'reward').text(d.currentRiskVReward.reward.toFixed(2))
                    .attr('dx', 8).attr('dy', 5).attr('fill', 'white').attr('opacity', 0)
                    .attr('x', x2Position).attr('y', yPosition)


                planGroup.append('line').attr('class', 'riskRewardSpread').attr('stroke', d => sectorColors[d.sector]).attr('stroke-width', 2)
                    .attr('y1', yPosition).attr('y2', yPosition).attr('x1', x1Position).attr('x2', x2Position)

                planGroup.append('circle').attr('class', 'riskCircle').attr('cx', x1Position).attr('cy', yPosition).attr('r', 5).attr('fill', d => sectorColors[d.sector])
                planGroup.append('circle').attr('class', 'rewardCircle').attr('cx', x2Position).attr('cy', yPosition).attr('r', 5).attr('fill', d => sectorColors[d.sector])
            })
        }
        function updatePlanGroup(update)
        {
            update.each(function (d, i)
            {
                const planGroup = select(this)
                let yPosition = yScale(-d.percentFromEnter)
                let x1Position = xScale(-d.currentRiskVReward.risk)
                let x2Position = xScale(d.currentRiskVReward.reward)

                planGroup.select('.riskRewardSpread').attr('y1', yPosition).attr('y2', yPosition).attr('x1', x1Position).attr('x2', x2Position)
                planGroup.select('.riskCircle').attr('cx', x1Position).attr('cy', yPosition)
                planGroup.select('.rewardCircle').attr('cx', x2Position).attr('cy', yPosition)

                planGroup.select('.ticker').attr("x", x1Position).attr("y", yPosition)
                    .attr('dx', (d) => { return ((x2Position - x1Position) / 2) - 16 })

                planGroup.select('.risk').attr("x", x1Position).attr("y", yPosition).text(`-${d.currentRiskVReward.risk.toFixed(2)}`)
                planGroup.select('.reward').attr("x", x2Position).attr("y", yPosition).text(d.currentRiskVReward.reward.toFixed(2))
            })
        }
        function removePlanGroup(remove)
        {
            remove.each(function (d, i) { select(this).remove() })
        }

    }, [enterExitPlans, rvrChartDimensions, zoomState, zoomStateY])




    useEffect(() =>
    {
        if (!rvrChartDimensions) return
        const rvrChartSelection = select(rvrChart.current).select('.xAxis')

        const zoomBehavior = zoom().on('zoom', () =>
        {
            const zoomState = zoomTransform(rvrChartSelection.node())
            setZoomState(zoomState)
        })
        rvrChartSelection.call(zoomBehavior)
    }, [rvrChartDimensions])

    useEffect(() =>
    {
        if (!rvrChartDimensions) return
        const rvrChartSelection = select(rvrChart.current).select('.yAxis')

        const zoomBehavior = zoom().on('zoom', () =>
        {
            const zoomState = zoomTransform(rvrChartSelection.node())
            setZoomStateY(zoomState)
        })
        rvrChartSelection.call(zoomBehavior)
    }, [rvrChartDimensions])

    useEffect(() =>
    {
        if (!rvrChartDimensions) return


        const bestSelect = select(rvrChart.current).select('.best')
        let height = yScale(-1.5) - yScale(1.5)
        bestSelect
            .attr("x", xScale(0))
            .attr("y", yScale(1.5))
            .attr("width", ((rvrChartDimensions.width / 2) - 5))
            .attr("height", height)
            .attr("fill", "url(#myFadeGradient)")
            .attr('opacity', 0.5);

        const worstSelect = select(rvrChart.current).select('.worst')
        worstSelect
            .attr("x", 0)
            .attr("y", yScale(1.5))
            .attr("width", ((rvrChartDimensions.width / 2) - 5))
            .attr("height", height)
            .attr("fill", "url(#myFadeGradientBad)")
            .attr('opacity', 0.5);

    }, [rvrChartDimensions, zoomState, zoomStateY])



    return (
        <div ref={rvrChartWrapper} className='positionChartWrapper'>
            <svg ref={rvrChart} fill='blue'>
                <defs>
                    <linearGradient id="myFadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="steelblue" stop-opacity="0" />
                        <stop offset="50%" stop-color="steelblue" stop-opacity="1" />
                        <stop offset="100%" stop-color="steelblue" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient id="myFadeGradientBad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="orange" stop-opacity="0" />
                        <stop offset="50%" stop-color="orange" stop-opacity="1" />
                        <stop offset="100%" stop-color="orange" stop-opacity="0" />
                    </linearGradient>
                </defs>

                <rect className='best' />

                <rect className='worst' />

                <g className='xAxis' />
                <g className='yAxis' />
                <g className='enterExitPlans' />

            </svg>
        </div>
    )
}

export default RiskToRewardPercentFromEnter