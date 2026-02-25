import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'
import { axisBottom, axisLeft, max, min, scaleLinear, select } from 'd3'

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
        let scale = scaleLinear().domain([33, -33]).range([dollarChartDimensions.width - 20, 20]);

        return scale
    }, [dollarChartDimensions, zoomStateY]);

    const yScale = useMemo(() =>
    {
        if (!dollarChartDimensions) return
        const minReward = min(enterExitPlans, d => d.with1000DollarsCurrentGain)
        const maxReward = max(enterExitPlans, d => d.with1000DollarsCurrentGain)

        let scale = scaleLinear().domain([(maxReward * 1.1), (minReward * 0.9)]).range([20, dollarChartDimensions.height - 20]);

        if (zoomState)
        {
            const newZoomState = zoomState.rescaleX(scale)
            scale.domain(newZoomState.domain())
        }

        return scale
    }, [enterExitPlans, dollarChartDimensions, zoomState]);



    let sectorColors = {
        'Healthcare': 'yellow',
        'Consumer Staples': 'blue'
    }
    useEffect(() =>
    {
        if (!dollarChartDimensions) return
        const dollarChartSelection = select(dollarsChart.current)

        dollarChartSelection.select('.xAxis').attr('transform', `translate(0,${dollarChartDimensions.height - 20})`).call(axisBottom(xScale))
        dollarChartSelection.select('.yAxis').attr("transform", `translate(${xScale(0)}, 0)`).call(axisLeft(yScale))

        dollarChartSelection.select('.enterExitPlans').selectAll('.planGroups').data(enterExitPlans, d => d.tickerSymbol)
            .join(enter => createPlanGroup(enter), update => updatePlanGroup(update), remove => removePlanGroup(remove))


        function createPlanGroup(enter)
        {
            enter.each(function (d, i)
            {
                let x1Position = xScale(-d.percentFromEnter)
                let yPosition = yScale(d.with1000DollarsCurrentGain)

                var planGroup = select(this).append('g').attr('class', 'planGroups')
                planGroup.append('text').attr('class', 'ticker').text(`${d.tickerSymbol}-$${d.with1000DollarsCurrentGain.toFixed(2)}`)
                    .attr("x", x1Position).attr("y", yPosition)
                    .attr('dx', (d) => - 16)
                    .attr('dy', -10).attr('fill', 'white')
                    .attr('visibility', 'visible');

                planGroup.append('circle').attr('class', 'riskCircle')
                    .attr('cx', x1Position).attr('cy', yPosition)
                    .attr('r', 5).attr('fill', d => sectorColors[d.sector])
            })
        }
        function updatePlanGroup(update)
        {
            update.each(function (d, i)
            {
                let x1Position = xScale(-d.percentFromEnter)
                let yPosition = yScale(d.with1000DollarsCurrentGain)

                const planGroup = select(this)
                planGroup.select('.riskCircle').attr('cx', x1Position).attr('cy', yPosition)
                planGroup.select('.ticker').attr("x", x1Position).attr("y", yPosition)
            })
        }
        function removePlanGroup(remove)
        {
            remove.each(function (d, i) { select(this).remove() })
        }

    }, [enterExitPlans, dollarChartDimensions, zoomState, zoomStateY])

    return (
        <div ref={dollarChartWrapper} className='positionChartWrapper'>
            <svg ref={dollarsChart}>
                <g className='yAxis' />
                <g className='xAxis' />
                <g className='enterExitPlans' />
            </svg>
        </div>
    )
}

export default With1000DollarsVisual