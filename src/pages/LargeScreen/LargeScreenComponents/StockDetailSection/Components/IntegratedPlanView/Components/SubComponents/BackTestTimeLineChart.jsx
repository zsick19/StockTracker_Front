import React, { useEffect, useRef } from 'react'
import { useResizeObserver } from '../../../../../../../../hooks/useResizeObserver'
import { axisBottom, extent, max, scaleLinear, scaleSqrt, scaleTime, select, selectAll, timeWeeks } from 'd3'
import { discontinuitySkipUtcWeekends, discontinuitySkipWeekends, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'

function BackTestTimeLineChart({ backTests, relevantCandleDate, entry, exit, stopLoss, entryPriceDisplay, setPatternOrStockChart, backTestAverage, hideText })
{
    const timeLineRef = useRef()
    const timeLineWrapper = useRef(null)
    const timeLineDimensions = useResizeObserver(timeLineWrapper)

    const preDimensionsAndData = () => { return !timeLineDimensions }
    const weekTicks = timeWeeks(new Date(relevantCandleDate), new Date())



    useEffect(() =>
    {
        if (preDimensionsAndData()) return

        const timeLineSVG = select(timeLineRef.current)

        timeLineSVG.select('.timeAxis').selectAll('*').remove()
        timeLineSVG.select('.painGain').selectAll('*').remove()
        timeLineSVG.select('.price').selectAll('*').remove()
        timeLineSVG.select('.printOuts').selectAll('*').remove()


        const xScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuitySkipUtcWeekends()).domain([new Date(relevantCandleDate), new Date()]).range([0, timeLineDimensions.width])
        const radiusScale = scaleSqrt().domain(extent(backTests, d => d.details.holdDays)).range([4, 10])

        const scaleHeight = Math.max(max(backTests, d => d.pain.maxPain), max(backTests, d => d.gain.maxGain))

        const yScale = scaleLinear().domain([-scaleHeight * 1.25, scaleHeight * 1.25]).range([0, timeLineDimensions.height])



        timeLineSVG.select('.backTests').selectAll('circle').data(backTests).join('circle')
            .attr("fill", d => d.details.wasExitHit ? "green" : "yellow")
            .attr('cx', (d, i) => xScale(new Date(d.details.tradeDate))).attr('cy', timeLineDimensions.height / 2)
            .attr('r', d => radiusScale(d.details.holdDays))
            .attr('stroke', d => d.details.wasStopHit ? 'red' : 'green').attr("stroke-width", 2)
            .on('mouseover', function (e, d)
            {
                const toolTip = select("body").append("div").attr('class', 'toolTipBackTest').style("position", "absolute")
                    .style("background-color", "rgba(0, 0, 0, 0.8)").style("color", "#fff").style("padding", "8px").style("border-radius", "4px")
                    .style("font-size", "12px").style("pointer-events", "none")

                toolTip.html(`
                        <p>Hold: ${d.details.holdDays}</p> 
                        <p>Gain: $${d.gain.maxGain}</p> 
                        <p>Pain: $${d.pain.maxPain}</p>                        
                        `)
                    .style('top', (e.pageY + 5) + "px")
                    .style('left', (e.pageX + 5) + "px")
            })
            .on("mousemove", function (e) { select('body').select('.toolTipBackTest').style('top', (e.pageY + 5) + "px").style('left', (e.pageX + 5) + "px") })
            .on("mouseout", function () { select("body").selectAll('.toolTipBackTest').remove() })
            .on('mousedown', (e, d) => setPatternOrStockChart(prev =>
            {
                return {
                    display: true,
                    entryDate: d.details.tradeDate,
                    maxGainDate: d.gain.dateOfHighestValue,
                    maxPainDate: d.pain.dateOfLowestValue
                }
            }))



        timeLineSVG.select('.timeAxis')
            .call(axisBottom(xScale).tickValues(weekTicks))
            .attr('transform', `translate(0,${timeLineDimensions.height / 2})`)

        const exitPixel = yScale(Math.floor(1000 / entry) * (exit - entry))
        const stopLossPixel = yScale(Math.floor(1000 / entry) * (entry - stopLoss))



        timeLineSVG.select('.price').append('line')
            .attr('x1', 0).attr('x2', timeLineDimensions.width)
            .attr('y1', timeLineDimensions.height - exitPixel).attr('y2', timeLineDimensions.height - exitPixel)
            .attr('stroke', 'green').attr('stroke-width', 1)

        timeLineSVG.select('.price').append('line')
            .attr('x1', 0).attr('x2', timeLineDimensions.width)
            .attr('y1', stopLossPixel).attr('y2', stopLossPixel)
            .attr('stroke', 'red').attr('stroke-width', 1)

        timeLineSVG.select('.painGain').selectAll('.maxGain')
            .data(backTests).join('line').attr('class', '.maxGain')
            .attr('x1', d => xScale(new Date(d.details.tradeDate))).attr('x2', d => xScale(new Date(d.details.tradeDate)))
            .attr('y1', yScale(0)).attr('y2', d => yScale(-d.gain.maxGain))
            .attr('stroke', 'green').attr('stroke-width', 4).attr('stroke-linecap', 'round')

        timeLineSVG.select('.painGain').selectAll('.maxPain')
            .data(backTests).join('line').attr('class', '.maxPain')
            .attr('x1', d => xScale(new Date(d.details.tradeDate))).attr('x2', d => xScale(new Date(d.details.tradeDate)))
            .attr('y1', yScale(0)).attr('y2', d => yScale(d.pain.maxPain))
            .attr('stroke', 'red').attr('stroke-width', 4).attr('stroke-linecap', 'round')


        backTests.length > 0 && !hideText &&
            timeLineSVG.select('.printOuts').append('text')
                .text(`Exit Line $${backTestAverage.positionReward} // Stop Line $${backTestAverage.positionRisk}
            //  Max Gain: $${backTestAverage.patternMaxGain} at $${backTestAverage.highestPatternValue.toFixed(2)}
            //  Max Pain: -$${backTestAverage.patternMaxPain} at $${backTestAverage.lowestPatternValue.toFixed(2)}
            //  Average Gain ${backTestAverage.averageGainPercent}% vs Average Pain ${backTestAverage.averagePainPercent}% from $${entry.toFixed(2)} Entry
            `).attr('x', 25).attr('y', timeLineDimensions.height - 10).style("fill", "white").style("font-size", "12px")

        return (() =>
        {

            select("body").selectAll('.toolTipBackTest').remove()
        })

    }, [timeLineDimensions, backTests])











    return (
        <div ref={timeLineWrapper} className='BackTestTimeLineWrapper' style={{ border: `3px solid ${entryPriceDisplay ? 'blue' : 'orange'}` }}>
            <svg ref={timeLineRef} style={{ width: '100%', backgroundColor: 'black' }} >
                <div className='info'
                    style={{ position: 'absolute', pointerEvents: 'none', zIndex: '100', visibility: 'hidden', color: 'white', fontSize: '10', backgroundColor: 'blue', height: '30', width: '30' }} >
                </div>
                <g className='timeAxis' />
                <g className='backTests' />
                <g className='painGain' />
                <g className='price' />
                <g className='printOuts' />
            </svg>
        </div>
    )
}

export default BackTestTimeLineChart