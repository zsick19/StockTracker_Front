import { axisBottom, axisLeft, max, scaleLinear, select, zoom, zoomTransform } from 'd3'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'

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

        let scale = scaleLinear().domain([(centerSplit * -1.1), (centerSplit * 1.1)]).range([20, rvrChartDimensions.width - 20]);

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
        let scale = scaleLinear().domain([-3, 3]).range([rvrChartDimensions.height - 20, 20]);

        return scale
    }, [rvrChartDimensions, zoomStateY]);

    let sectorColors = {
        'Healthcare': 'yellow',
        'Consumer Staples': 'blue'
    }

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
                let yPosition = yScale(-d.percentFromEnter)
                let x1Position = xScale(-d.currentRiskVReward.risk)
                let x2Position = xScale(d.currentRiskVReward.reward)

                planGroup.append('text').attr('class', 'ticker').text(d.tickerSymbol)
                    .attr("x", x1Position).attr("y", yPosition)
                    .attr('dx', (d) => { return ((x2Position - x1Position) / 2) - 16 })
                    .attr('dy', -10).attr('fill', 'white')
                    .attr('visibility', 'visible');

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





    return (
        <div ref={rvrChartWrapper} className='positionChartWrapper'>
            <svg ref={rvrChart} fill='blue'>
                <g className='xAxis' fill='blue' />
                <g className='yAxis' fill='blue' />
                <g className='enterExitPlans' />
            </svg>
        </div>
    )
}

export default RiskToRewardPercentFromEnter