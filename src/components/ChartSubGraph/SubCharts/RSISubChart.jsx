import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from '../../../hooks/useResizeObserver'
import { rsiCalc } from '../../../Utilities/technicalIndicatorFunctions'
import { addDays, addYears, isSaturday, isSunday, sub, subDays, subMonths } from 'date-fns'
import { axisBottom, axisLeft, curveBasis, curveLinear, extent, line, max, scaleLinear, scaleTime, select, selectAll, timeDay, timeMonths, zoom, zoomIdentity, zoomTransform } from 'd3'
import { discontinuityRange, discontinuitySkipUtcWeekends, discontinuitySkipWeekends, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'
import { makeSelectZoomStateByUUID } from '../../../features/Charting/GraphHoverZoomElement'
import { useSelector } from 'react-redux'
import { generateTradingHours, getBreaksBetweenDates, provideStartAndEndDatesForDateScale } from '../../../Utilities/TimeFrames'
import { makeSelectGraphCrossHairsByUUID } from '../../../features/Charting/GraphToSubGraphCrossHairElement'
import { makeSelectGraphHoursByUUID } from '../../../features/Charting/GraphMarketHourElement'
import { pixelBuffer } from '../GraphChartConstants'

function RSISubChart({ candleData, uuid, timeFrame, hideTimeLine })
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

    const selectedChartZoomStateMemo = useMemo(makeSelectZoomStateByUUID, [])
    const chartZoomState = useSelector(state => selectedChartZoomStateMemo(state, uuid))

    const selectCurrentXCrossHair = useMemo(makeSelectGraphCrossHairsByUUID, [])
    const currentCrossHairX = useSelector(state => selectCurrentXCrossHair(state, uuid))


    const selectDisplayMarketHoursMemo = useMemo(makeSelectGraphHoursByUUID, [])
    const displayMarketHours = useSelector((state) => selectDisplayMarketHoursMemo(state, uuid))

    const [yZoomState, setYZoomState] = useState(undefined)


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



    const yPixelBufferBottom = hideTimeLine ? 0 : 20
    const yPixelBufferTop = hideTimeLine ? 5 : 10


    const RSIMax = useMemo(() => extent(rsiData, (d) => d.rsi), [rsiData])

    const createYScale = useCallback(({ rsiToPixel = undefined, pixelToRSI = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return


        const yScale = scaleLinear()
            .domain([RSIMax[0] < 30 ? RSIMax[0] * 0.98 : 25, RSIMax[1] > 70 ? RSIMax[1] * 1.02 : 70])
            .range([chartDimensions.height - yPixelBufferBottom, yPixelBufferTop])

        if (yZoomState)
        {
            const zoomValues = zoomIdentity.translate(0, yZoomState.y).scale(yZoomState.k)
            const newZoomState = zoomValues.rescaleX(yScale)
            yScale.domain(newZoomState.domain())
        }

        if (pixelToRSI !== undefined) return Math.round(yScale.invert(pixelToRSI) * 100) / 100
        if (rsiToPixel !== undefined) return yScale(rsiToPixel)

        else return yScale

    }, [candleData, yZoomState, chartDimensions])

    const rsiLine = line().x((d, i) => createDateScale({ dateToPixel: candleData[i + periodBlock].Timestamp })).y(d => createYScale({ rsiToPixel: d.rsi })).curve(curveLinear)

    //draw RSI and axis lines
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        const svg = select(XSVG.current)
        const yScaleSVG = select(YSVG.current)

        if (!hideTimeLine)
        {
            let xAxis
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
            svg.select('.x-axis').style('transform', `translateY(${chartDimensions.height - yPixelBufferBottom}px)`).call(xAxis)
        }

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

    }, [candleData, excludedPeriods, chartZoomState?.x, chartDimensions])



    //draw visual time breaks
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        let dateVisualSelect = select(XSVG.current).select('.visualDateBreaks')
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
                    .attr('x', (d, i) => createDateScale({ dateToPixel: d })).attr('y', hideTimeLine ? 5 : -pixelBuffer.yDirectionPixelBuffer)
                    .attr('width', (d, i) => { return pixelDates[i + 1] - createDateScale({ dateToPixel: d }) })
                    .attr('height', chartDimensions.height)
            }
        }

    }, [chartDimensions, excludedPeriods, chartZoomState?.x, chartZoomState?.y, timeFrame])

    //zoomYBehavior
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        const yScaleSVG = select(YSVG.current)
        const zoomBehavior = zoom().on('zoom', () =>
        {
            const zoomState = zoomTransform(yScaleSVG.node())
            setYZoomState({ x: zoomState.x, y: zoomState.y, k: zoomState.k })
        })

        yScaleSVG.call(zoomBehavior)



    }, [candleData, chartZoomState, yScaleDimensions, timeFrame])

    //draw crosshair 
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        const svg = select(XSVG.current)

        if (currentCrossHairX?.x)
        {
            svg.select('.crossHair').select('.yTrace').attr('x1', currentCrossHairX.x).attr('x2', currentCrossHairX.x)
                .attr('y1', 0).attr('y2', chartDimensions.height).attr('stroke', 'black').attr('stroke-width', '1px')
                .attr('visibility', 'visible')
        } else
        {
            svg.select('.crossHair').select('.yTrace').attr('visibility', 'hidden')
        }
    }, [currentCrossHairX])

    const currentValue = useMemo(() => rsiData.at(-1).rsi, [rsiData])

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

export default RSISubChart