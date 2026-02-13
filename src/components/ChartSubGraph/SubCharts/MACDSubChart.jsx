import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useResizeObserver } from '../../../hooks/useResizeObserver'
import { calculateYAxisRange, MACDCalc, rsiCalc } from '../../../Utilities/technicalIndicatorFunctions'
import { addDays, addYears, eachDayOfInterval, isSaturday, isSunday, sub, subDays, subMonths } from 'date-fns'
import { axisBottom, axisLeft, curveBasis, line, scaleLinear, scaleTime, select, selectAll, svg, timeDay, timeMonths, zoomIdentity } from 'd3'
import { discontinuityRange, discontinuitySkipUtcWeekends, discontinuitySkipWeekends, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'
import { makeSelectZoomStateByUUID } from '../../../features/Charting/GraphHoverZoomElement'
import { useSelector } from 'react-redux'
import { generateTradingHours, getBreaksBetweenDates, provideStartAndEndDatesForDateScale } from '../../../Utilities/TimeFrames'
import { makeSelectGraphCrossHairsByUUID } from '../../../features/Charting/GraphToSubGraphCrossHairElement'
import { makeSelectGraphHoursByUUID } from '../../../features/Charting/GraphMarketHourElement'
import { pixelBuffer } from '../GraphChartConstants'

function MACDSubChart({ candleData, uuid, timeFrame })
{
    const YSVGWrapper = useRef()
    const YSVG = useRef()
    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const yScaleDimensions = useResizeObserver(YSVG)
    const chartDimensions = useResizeObserver(XSVG)
    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }
    const MACDData = useMemo(() => MACDCalc(candleData), [candleData])
    const MACDRange = useMemo(() => calculateYAxisRange(MACDData.slice(MACDData.length - 250)), [MACDData])


    const selectedChartZoomStateMemo = useMemo(makeSelectZoomStateByUUID, [])
    const chartZoomState = useSelector(state => selectedChartZoomStateMemo(state, uuid))


    const selectCurrentXCrossHair = useMemo(makeSelectGraphCrossHairsByUUID, [])
    const currentCrossHairX = useSelector(state => selectCurrentXCrossHair(state, uuid))


    const selectDisplayMarketHoursMemo = useMemo(makeSelectGraphHoursByUUID, [])
    const displayMarketHours = useSelector((state) => selectDisplayMarketHoursMemo(state, uuid))

    const excludedPeriods = useMemo(() => { if (timeFrame.intraDay) return generateTradingHours(timeFrame, displayMarketHours?.showOnlyIntraDay) }, [timeFrame, displayMarketHours?.showOnlyIntraDay])


    const dateBetweenStartAndFinishInterval = useMemo(() =>
    {
        if (timeFrame.intraDay) { return eachDayOfInterval({ start: subDays(new Date(), 30), end: addDays(new Date(), 30) }) }
        else return undefined
    }, [timeFrame])

    const visualBreaksPeriods = useMemo(() =>
    {

        if (timeFrame.intraDay && timeFrame.duration > 3)
        {
            return getBreaksBetweenDates(subDays(new Date(), 10), addDays(new Date(), 10), 'days')
        } else if (timeFrame.intraDay && timeFrame.duration <= 3)
        {
            return getBreaksBetweenDates(subDays(new Date(), 10), addDays(new Date(), 4), 'marketOpen')
        } else
        {
            return getBreaksBetweenDates(new Date(2024, 1, 1), addYears(new Date(), 1), 'months')
        }

    }, [timeFrame])

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

    }, [candleData, excludedPeriods, chartZoomState?.x, chartDimensions])

    const yPixelBufferBottom = 20
    const createYScale = useCallback(({ MACDToPixel = undefined, pixelToMACD = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const yPixelBufferTop = 10

        const yScale = scaleLinear().domain([MACDRange.min, MACDRange.max]).range([chartDimensions.height - yPixelBufferBottom, yPixelBufferTop])

        if (pixelToMACD !== undefined) return Math.round(yScale.invert(pixelToMACD) * 100) / 100
        if (MACDToPixel !== undefined) return yScale(MACDToPixel)

        else return yScale

    }, [candleData, chartDimensions])

    const macdLine = line().x((d, i) => createDateScale({ dateToPixel: d.Timestamp })).y(d => createYScale({ MACDToPixel: d.macd })).curve(curveBasis)
    const signalLine = line().x((d, i) => createDateScale({ dateToPixel: d.Timestamp })).y(d => createYScale({ MACDToPixel: d.signal })).curve(curveBasis)

    const svg = select(XSVG.current)
    //draw MACD Lines
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

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

        //yScaleSVG.select('.y-axis').style('transform', `translateX(${yScaleDimensions.width - 1}px)`).call(yAxis)
        svg.select('.x-axis').style('transform', `translateY(${chartDimensions.height - yPixelBufferBottom}px)`).call(xAxis)


        svg.select('.macdLine').selectAll('.lineGroup').data([MACDData]).join((enter) => createMACDLine(enter), (update) => updateMACDLine(update))

        function createMACDLine(enter)
        {
            let lineGroup = enter.append('g').attr('class', 'lineGroup')
            lineGroup.append('path').attr('class', 'macd').attr('d', macdLine(MACDData)).attr('stroke', 'blue').attr('fill', 'none')
            lineGroup.append('path').attr('class', 'signal').attr('d', signalLine(MACDData)).attr('stroke', 'orange').attr('fill', 'none')
        }
        function updateMACDLine(update)
        {
            let group = svg.select('.macdLine').select('.lineGroup')
            group.select('.macd').attr('d', macdLine(MACDData))
            group.select('.signal').attr('d', signalLine(MACDData))
        }


    }, [candleData, excludedPeriods, chartZoomState?.x, chartDimensions])

    //draw visual time breaks
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        let dateVisualSelect = svg.select('.visualDateBreaks')
        if (timeFrame.intraDay && !displayMarketHours.showOnlyIntraDay)
        {
            dateVisualSelect.selectAll('.visualBreak').remove()
            dateVisualSelect.selectAll('.dayBreakLine').remove()
            dateVisualSelect.selectAll('.preMarketVisualBreak').data([...visualBreaksPeriods.preMarket]).join(enter => createMarketOpenVisualBreaks(enter), update => updateMarketOpenVisualBreaks(update))
            function createMarketOpenVisualBreaks(enter)
            {
                enter.each(function (d, i)
                {
                    let start = createDateScale({ dateToPixel: d })
                    let marketClose = createDateScale({ dateToPixel: visualBreaksPeriods.marketClose[i] })
                    var visualBreakGroups = select(this).append('g').attr('class', 'preMarketVisualBreak')

                    visualBreakGroups.append('rect').attr('class', 'preMarket')
                        .attr('x', (d, i) => start).attr('y', -pixelBuffer.yDirectionPixelBuffer)
                        .attr('width', (d) => createDateScale({ dateToPixel: visualBreaksPeriods.preMarketEnd[i] }) - start)
                        .attr('height', chartDimensions.height)


                    visualBreakGroups.append('rect').attr('class', 'afterMarket')
                        .attr('x', (d, i) => marketClose).attr('y', -pixelBuffer.yDirectionPixelBuffer)
                        .attr('width', (d) => createDateScale({ dateToPixel: visualBreaksPeriods.afterMarket[i] }) - marketClose)
                        .attr('height', chartDimensions.height)
                })
            }
            function updateMarketOpenVisualBreaks(update)
            {
                update.each(function (d, i)
                {
                    let start = createDateScale({ dateToPixel: d })
                    let marketClose = createDateScale({ dateToPixel: visualBreaksPeriods.marketClose[i] })

                    const visualBreakGroups = select(this)
                    visualBreakGroups.select('.preMarket').attr('x', createDateScale({ dateToPixel: d })).attr('y', -pixelBuffer.yDirectionPixelBuffer).attr('width', (d) => createDateScale({ dateToPixel: visualBreaksPeriods.preMarketEnd[i] }) - start)
                    visualBreakGroups.select('.afterMarket').attr('x', marketClose).attr('y', -pixelBuffer.yDirectionPixelBuffer)
                        .attr('width', (d) => createDateScale({ dateToPixel: visualBreaksPeriods.afterMarket[i] }) - marketClose)
                })
            }
        }
        else if (timeFrame.intraDay && displayMarketHours.showOnlyIntraDay)
        {
            dateVisualSelect.selectAll('.visualBreak').remove()
            dateVisualSelect.selectAll('.preMarketVisualBreak').remove()

            dateVisualSelect.selectAll('.dayBreakLine').data(dateBetweenStartAndFinishInterval).join(enter => createDayLineBreaks(enter), update => updateDayLineBreaks(update))
            function createDayLineBreaks(enter)
            {
                enter.each(function (d, i)
                {
                    let dateX = createDateScale({ dateToPixel: d })
                    dateVisualSelect.append('line').attr('class', 'dayBreakLine')
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
        }
        else if (!timeDay.intraDay)
        {
            dateVisualSelect.selectAll('.dayBreakLine').remove()
            dateVisualSelect.selectAll('.preMarketVisualBreak').remove()
            dateVisualSelect.selectAll('.visualBreak').remove()
            let pixelDates = visualBreaksPeriods.months.map((d) => createDateScale({ dateToPixel: d }))
            dateVisualSelect.selectAll('.visualBreak').data(visualBreaksPeriods.months).join(enter => createVisualBreaks(enter))
            function createVisualBreaks(enter)
            {
                enter.append('rect').attr('class', (d, i) => { return i % 2 !== 0 ? 'monthOdd visualBreak' : 'monthEven visualBreak' })
                    .attr('x', (d, i) => createDateScale({ dateToPixel: d })).attr('y', -pixelBuffer.yDirectionPixelBuffer)
                    .attr('width', (d, i) => { return pixelDates[i + 1] - createDateScale({ dateToPixel: d }) })
                    .attr('height', chartDimensions.height)
            }
        }
    }, [chartDimensions, excludedPeriods, chartZoomState?.x, chartZoomState?.y, timeFrame])


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
        <div className='SubChartContainer'>
            <div className='subChartGraph'>
                <div ref={YSVGWrapper} className='subChartWithVerticalTitle'>
                    <p>MACD</p>
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
                        <g className='macdLine' />
                        <g className='zeroLine'>
                            <line className='zeroLine' x1={-10000} x2={10000} y1={createYScale({ MACDToPixel: 0 })} y2={createYScale({ MACDToPixel: 0 })} stroke='black' strokeWidth={'0.5px'} />
                        </g>
                        <g className='histogramLine' />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default MACDSubChart