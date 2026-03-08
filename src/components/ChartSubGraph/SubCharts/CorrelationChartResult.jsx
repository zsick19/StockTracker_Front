import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useResizeObserver } from '../../../hooks/useResizeObserver'
import { calculateCorrelation } from '../../../Utilities/technicalIndicatorFunctions'
import { makeSelectZoomStateByUUID } from '../../../features/Charting/GraphHoverZoomElement'
import { makeSelectGraphCrossHairsByUUID } from '../../../features/Charting/GraphToSubGraphCrossHairElement'
import { makeSelectGraphHoursByUUID } from '../../../features/Charting/GraphMarketHourElement'
import { useSelector } from 'react-redux'
import { generateTradingHours, provideStartAndEndDatesForDateScale } from '../../../Utilities/TimeFrames'
import { discontinuityRange, discontinuitySkipUtcWeekends, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'
import { axisBottom, axisLeft, curveBasis, curveLinear, line, scaleLinear, scaleTime, select, selectAll, timeMonths, zoomIdentity, zoomTransform } from 'd3'
import { subDays, subMonths } from 'date-fns'

function CorrelationChartResult({ ticker1Data, ticker2Data, uuid, timeFrame, setDisplayTickerInput })
{
    const YSVGWrapper = useRef()
    const YSVG = useRef()
    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const yScaleDimensions = useResizeObserver(YSVG)
    const chartDimensions = useResizeObserver(XSVG)
    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }
    const correlationCalculation = useMemo(() => { return calculateCorrelation(ticker1Data, ticker2Data) }, [timeFrame])

    const selectedChartZoomStateMemo = useMemo(makeSelectZoomStateByUUID, [])
    const chartZoomState = useSelector(state => selectedChartZoomStateMemo(state, uuid))

    const selectCurrentXCrossHair = useMemo(makeSelectGraphCrossHairsByUUID, [])
    const currentCrossHairX = useSelector(state => selectCurrentXCrossHair(state, uuid))


    const selectDisplayMarketHoursMemo = useMemo(makeSelectGraphHoursByUUID, [])
    const displayMarketHours = useSelector((state) => selectDisplayMarketHoursMemo(state, uuid))

    const excludedPeriods = useMemo(() => { if (timeFrame.intraDay) return generateTradingHours(timeFrame, displayMarketHours?.showOnlyIntraDay) }, [timeFrame, displayMarketHours?.showOnlyIntraDay])


    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const startEndDate = provideStartAndEndDatesForDateScale(timeFrame)

        let xDateScale
        if (timeFrame.intraDay)
        {
            xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuityRange(...excludedPeriods))
                .domain([startEndDate.startDate, startEndDate.futureForwardEndDate]).range([0, chartDimensions.width])
        } else
        {
            xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuitySkipUtcWeekends())
                .domain([startEndDate.startDate, startEndDate.futureForwardEndDate]).range([0, chartDimensions.width])
        }

        if (chartZoomState?.x)
        {
            const zoomValues = zoomIdentity.translate(chartZoomState.x.x, chartZoomState.x.y).scale(chartZoomState.x.k)
            const newZoomState = zoomValues.rescaleX(xDateScale)
            xDateScale.domain(newZoomState.domain())
        }

        if (pixelToDate !== undefined) { if (timeFrame.intraDay) { return new Date(Math.floor(xDateScale.invert(pixelToDate))).toISOString() } else return xDateScale.invert(pixelToDate).toISOString() }
        else if (dateToPixel !== undefined) return xDateScale(new Date(dateToPixel))
        else return xDateScale

    }, [timeFrame, excludedPeriods, chartZoomState?.x, chartDimensions])

    const yPixelBufferBottom = 20
    const createYScale = useCallback(({ correlationToPixel = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const yPixelBufferTop = 10

        const yScale = scaleLinear()
            .domain([-1, 1])
            .range([chartDimensions.height - yPixelBufferBottom, yPixelBufferTop])

        if (correlationToPixel !== undefined) return yScale(correlationToPixel)
        else return yScale


    }, [chartDimensions])

    const correlationLine = line().x((d, i) => createDateScale({ dateToPixel: d.x })).y(d => createYScale({ correlationToPixel: d.y })).curve(curveLinear)


    let lastEntry = correlationCalculation.at(-1)

    //draw correlation and axis lines
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        const svg = select(XSVG.current)
        const yScaleSVG = select(YSVG.current)

        let xAxis
        const yAxis = axisLeft(createYScale())

        if (timeFrame.intraDay && timeFrame.duration > 3)
        {
            xAxis = axisBottom(createDateScale()).tickValues(timeDay.range(subDays(new Date(), 10), new Date()))
        } else if (timeFrame.intraDay && timeFrame.duration <= 3)
        {
            xAxis = axisBottom(createDateScale())
        } else
        {
            xAxis = axisBottom(createDateScale()).tickValues(timeMonths(subMonths(new Date(), 12), new Date()))
        }



        yScaleSVG.select('.y-axis').style('transform', `translateX(${yScaleDimensions.width - 1}px)`).call(yAxis)
        svg.select('.x-axis').style('transform', `translateY(${chartDimensions.height - yPixelBufferBottom}px)`).call(xAxis)




        svg.select('.centerLine').attr('x1', 0).attr('x2', chartDimensions.width).attr('y1', createYScale({ correlationToPixel: 0 }))
            .attr('y2', createYScale({ correlationToPixel: 0 })).attr('stroke', 'blue')

        svg.select('.strongUpper').attr('x1', 0).attr('x2', chartDimensions.width).attr('y1', createYScale({ correlationToPixel: .70 }))
            .attr('y2', createYScale({ correlationToPixel: .70 })).attr('stroke', 'purple')

        svg.select('.midUpper').attr('x1', 0).attr('x2', chartDimensions.width).attr('y1', createYScale({ correlationToPixel: .29 }))
            .attr('y2', createYScale({ correlationToPixel: .29 })).attr('stroke', 'purple')

        svg.select('.midLower').attr('x1', 0).attr('x2', chartDimensions.width).attr('y1', createYScale({ correlationToPixel: -.29 }))
            .attr('y2', createYScale({ correlationToPixel: -.29 })).attr('stroke', 'purple')

        svg.select('.strongLower').attr('x1', 0).attr('x2', chartDimensions.width).attr('y1', createYScale({ correlationToPixel: -.70 }))
            .attr('y2', createYScale({ correlationToPixel: -.70 })).attr('stroke', 'purple')


        svg.select('.currentCorrelation').select('text').text(`${lastEntry.y}`).attr('x', createDateScale({ dateToPixel: lastEntry.x })).attr('y', createYScale({ correlationToPixel: lastEntry.y }))

        // svg.select('.currentCorrelation').select('line').attr('x1', 0).attr('x2', chartDimensions.width).attr('y1', createYScale({ correlationToPixel: lastEntry.y }))
        //     .attr('y2', createYScale({ correlationToPixel: lastEntry.y })).attr('stroke', 'green').attr('stroke-dasharray', '5 5')



        svg.select('.correlationLine').selectAll('path').data([correlationCalculation]).join((enter) => createCorrelationLine(enter), (update) => updateCorrelationLine(update))
        function createCorrelationLine(enter)
        {
            enter.append('path').attr('class', 'correlation').attr('d', correlationLine(correlationCalculation)).attr('stroke', 'black').attr('fill', 'none')
        }
        function updateCorrelationLine(update)
        {
            svg.select('.correlationLine').select('.correlation').attr('d', correlationLine(correlationCalculation))
        }

    }, [timeFrame, excludedPeriods, chartZoomState?.x, chartDimensions])


    //draw crosshair 
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        const svg = select(XSVG.current)

        if (currentCrossHairX.x)
        {
            svg.select('.crossHair').select('.yTrace').attr('x1', currentCrossHairX.x).attr('x2', currentCrossHairX.x)
                .attr('y1', 0).attr('y2', chartDimensions.height).attr('stroke', 'black').attr('stroke-width', '1px')
                .attr('visibility', 'visible')
        } else
        {
            svg.select('.crossHair').select('.yTrace').attr('visibility', 'hidden')
        }
    }, [currentCrossHairX])




    return (
        <>
            <div ref={YSVGWrapper} className='subChartWithVerticalTitle'>
                <p onClick={() => setDisplayTickerInput(prev => !prev)}>Correlation</p>
                <svg ref={YSVG} className='subChartYAxis'>
                    <g className='y-axis' />
                </svg>
            </div>


            <div ref={XSVGWrapper} className='subChartXAxis' >
                <svg ref={XSVG} >
                    <g className='x-axis' />
                    <g className='crossHair'>
                        <line className='yTrace' />
                    </g>
                    <line className='centerLine' />
                    <line className='strongUpper' />
                    <line className='midUpper' />

                    <line className='midLower' />
                    <line className='strongLower' />
                    <g className='correlationLine' />
                    <g className='currentCorrelation'>
                        <text />
                        <line />
                    </g>
                    <g className='correlationLegend'>
                        <text className='follow' fill='white' x={850} y={20}>Same Direction</text>
                        <text className='inverse' fill='white' x={850} y={125}>Inverse Direction</text>
                    </g>
                </svg>
            </div>

        </>
    )
}

export default CorrelationChartResult