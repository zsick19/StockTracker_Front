import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useResizeObserver } from '../../../../hooks/useResizeObserver'
import { addBusinessDays, eachWeekOfInterval, subBusinessDays } from 'date-fns'
import { getBreaksBetweenDates } from '../../../../Utilities/TimeFrames'
import { discontinuitySkipUtcWeekends, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'
import { axisBottom, axisLeft, curveLinear, extent, line, scaleLinear, scaleTime, select, selectAll, zoomIdentity } from 'd3'
import { pixelBuffer } from '../../GraphChartConstants'
import { rsiCalc } from '../../../../Utilities/technicalIndicatorFunctions'

function DailyRSISubChart({ candleData, chartZoomState, uuid, chartStartDate, timeFrame, hideTimeLine })
{
    let periodBlock = 14
    const YSVGWrapper = useRef()
    const YSVG = useRef()
    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const yScaleDimensions = useResizeObserver(YSVG)
    const chartDimensions = useResizeObserver(XSVG)

    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }
    const rsiData = useMemo(() => rsiCalc(candleData, periodBlock), [candleData])
    console.log(rsiData)

    const dateBetweenStartAndFinishInterval = useMemo(() => eachWeekOfInterval({ start: subBusinessDays(chartStartDate, 5), end: addBusinessDays(new Date(), 5) }), [chartStartDate])
    const visualBreaksPeriods = useMemo(() => getBreaksBetweenDates(new Date(chartStartDate), new Date(), 'days'), [chartStartDate])
    // const excludedPeriods = useMemo(() => generateMarketTradingHoursBetweenTwoDates(chartStartDate, new Date()), [chartStartDate])
    // const intraDayTickMarks = useMemo(() => generateIntraDayTickMarksBetweenTwoDates(chartStartDate, new Date()), [chartStartDate])


    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        let xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuitySkipUtcWeekends())
            .domain([subBusinessDays(chartStartDate, 5), addBusinessDays(new Date(), 5)]).range([0, chartDimensions.width])

        if (chartZoomState?.x)
        {

            const zoomValues = zoomIdentity.translate(chartZoomState.x.x, chartZoomState.x.y).scale(chartZoomState.x.k)
            const newZoomState = zoomValues.rescaleX(xDateScale)
            xDateScale.domain(newZoomState.domain())
        }

        if (pixelToDate !== undefined) return new Date(Math.floor(xDateScale.invert(pixelToDate))).toISOString()
        else if (dateToPixel !== undefined) return xDateScale(new Date(dateToPixel))
        else return xDateScale

    }, [candleData, chartZoomState?.x, chartDimensions, chartStartDate])

    const yPixelBufferBottom = hideTimeLine ? 0 : 20
    const yPixelBufferTop = hideTimeLine ? 5 : 10


    const RSIMax = useMemo(() => extent(rsiData, (d) => d.rsi), [rsiData])

    const createYScale = useCallback(({ rsiToPixel = undefined, pixelToRSI = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return


        const yScale = scaleLinear()
            .domain([RSIMax[0] < 30 ? RSIMax[0] * 0.98 : 25, RSIMax[1] > 70 ? RSIMax[1] * 1.02 : 70])
            .range([chartDimensions.height - yPixelBufferBottom, yPixelBufferTop])

        // if (yZoomState)
        // {
        //     const zoomValues = zoomIdentity.translate(0, yZoomState.y).scale(yZoomState.k)
        //     const newZoomState = zoomValues.rescaleX(yScale)
        //     yScale.domain(newZoomState.domain())
        // }

        if (pixelToRSI !== undefined) return Math.round(yScale.invert(pixelToRSI) * 100) / 100
        if (rsiToPixel !== undefined) return yScale(rsiToPixel)

        else return yScale

    }, [candleData, chartDimensions])

    const rsiLine = line().x((d, i) => createDateScale({ dateToPixel: candleData[i + periodBlock].Timestamp })).y(d => createYScale({ rsiToPixel: d.rsi })).curve(curveLinear)
    //draw RSI and axis lines
    const svg = select(XSVG.current)
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        const yScaleSVG = select(YSVG.current)

        // if (!hideTimeLine)
        // {
        //     let xAxis = axisBottom(createDateScale()).tickValues(timeMonths(subMonths(new Date(), 12), new Date()))
        //     svg.select('.x-axis').style('transform', `translateY(${chartDimensions.height - yPixelBufferBottom}px)`).call(xAxis)
        // }

        const yAxis = axisLeft(createYScale())
        yScaleSVG.select('.y-axis').style('transform', `translateX(${yScaleDimensions.width - 1}px)`).call(yAxis)


        svg.select('.rsiLine').selectAll('path').data([rsiData]).join((enter) => createRSILine(enter), (update) => updateRSILine(update))

        function createRSILine(enter)
        {
            enter.append('path').attr('class', 'rsi').attr('d', rsiLine(rsiData)).attr('stroke', 'black').attr('fill', 'none')
        }
        function updateRSILine(update)
        {
            svg.select('.rsiLine').select('.rsi').attr('d', rsiLine(rsiData))
        }

    }, [candleData, chartZoomState?.x, chartDimensions])





    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        let dateVisualSelect = svg.select('.visualDateBreaks')

        dateVisualSelect.selectAll('.visualBreak').remove()
        dateVisualSelect.selectAll('.preMarketVisualBreak').remove()

        dateVisualSelect.selectAll('.dayBreakLine').data(dateBetweenStartAndFinishInterval)
            .join(enter => createDayLineBreaks(enter), update => updateDayLineBreaks(update))
        function createDayLineBreaks(enter)
        {
            enter.each(function (d, i)
            {

                let dateX = createDateScale({ dateToPixel: d })
                dateVisualSelect.append('line').attr('class', `dayBreakLine ${d}`)
                    .attr('x1', dateX).attr('x2', dateX).attr('y1', 0).attr('y2', chartDimensions.height - pixelBuffer.yDirectionPixelBuffer)
                    .attr('stroke', 'blue').attr('stroke-width', '1px')
            })
        }
        function updateDayLineBreaks(update)
        {
            update.each(function (d, i)
            {
                let updateDateX = createDateScale({ dateToPixel: d })
                select(this).attr('x1', updateDateX).attr('x2', updateDateX)
            })
        }
    }, [chartDimensions, chartZoomState?.x, chartZoomState?.y])

    const currentValue = useMemo(() => rsiData.length > 0 ? rsiData.at(-1).rsi : 0, [rsiData])

    return (
        <div className='SubChartContainer'>
            <div className='subChartGraph'>
                <div ref={YSVGWrapper} className='subChartWithVerticalTitle'>
                    <p>RSI : {currentValue.toFixed()}</p>
                    <svg ref={YSVG} className='subChartYAxis'>
                        <g className='y-axis' />
                    </svg>
                </div>

                <div ref={XSVGWrapper} className='subChartXAxis' >
                    <svg ref={XSVG} >
                        <g className='x-axis' />
                        <g className='visualDateBreaks' />

                        <g className='crossHair'>
                            <line className='yTrace' />
                        </g>
                        <g className='rsiLine' />
                        <g className='overBoughtOverSold'>
                            <line className='overSold' x1={0} y1={createYScale({ rsiToPixel: 70 })} x2={chartDimensions?.width || 0} y2={createYScale({ rsiToPixel: 70 })} stroke='blue' />
                            <line className='overBought' x1={0} y1={createYScale({ rsiToPixel: 30 })} x2={chartDimensions?.width || 0} y2={createYScale({ rsiToPixel: 30 })} stroke='blue' />
                            <line className='rsiValue' x1={0} y1={createYScale({ rsiToPixel: currentValue })}
                                x2={chartDimensions?.width || 0} y2={createYScale({ rsiToPixel: currentValue })} opacity={0.5} stroke='gray' />
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default DailyRSISubChart