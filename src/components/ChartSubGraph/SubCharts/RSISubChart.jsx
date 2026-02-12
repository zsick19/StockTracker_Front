import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useResizeObserver } from '../../../hooks/useResizeObserver'
import { rsiCalc } from '../../../Utilities/technicalIndicatorFunctions'
import { addDays, isSaturday, isSunday, sub, subDays, subMonths } from 'date-fns'
import { axisBottom, axisLeft, curveBasis, line, scaleLinear, scaleTime, select, selectAll, timeDay, timeMonths, zoomIdentity } from 'd3'
import { discontinuityRange, discontinuitySkipUtcWeekends, discontinuitySkipWeekends, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'
import { makeSelectZoomStateByUUID } from '../../../features/Charting/GraphHoverZoomElement'
import { useSelector } from 'react-redux'
import { generateTradingHours, provideStartAndEndDatesForDateScale } from '../../../Utilities/TimeFrames'
import { makeSelectGraphCrossHairsByUUID } from '../../../features/Charting/GraphToSubGraphCrossHairElement'
import { makeSelectGraphHoursByUUID } from '../../../features/Charting/GraphMarketHourElement'

function RSISubChart({ candleData, uuid, timeFrame })
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

    const excludedPeriods = useMemo(() => { if (timeFrame.intraDay) return generateTradingHours(timeFrame, displayMarketHours?.showOnlyIntraDay) }, [timeFrame, displayMarketHours?.showOnlyIntraDay])




    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return


        const startEndDate = provideStartAndEndDatesForDateScale(timeFrame)
        let xDateScale
        if (timeFrame.intraDay)
        {
            xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuityRange(...excludedPeriods)).domain([startEndDate.startDate, startEndDate.futureForwardEndDate]).range([0, chartDimensions.width])
        } else
        {
            xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuitySkipUtcWeekends()).domain([startEndDate.startDate, startEndDate.futureForwardEndDate]).range([0, chartDimensions.width])
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
    const createYScale = useCallback(({ rsiToPixel = undefined, pixelToRSI = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const yPixelBufferTop = 10

        const yScale = scaleLinear()
            .domain([15, 90])
            .range([chartDimensions.height - yPixelBufferBottom, yPixelBufferTop])

        if (pixelToRSI !== undefined) return Math.round(yScale.invert(pixelToRSI) * 100) / 100
        if (rsiToPixel !== undefined) return yScale(rsiToPixel)

        else return yScale

    }, [candleData, chartDimensions])

    const rsiLine = line().x((d, i) => createDateScale({ dateToPixel: candleData[i + periodBlock].Timestamp })).y(d => createYScale({ rsiToPixel: d.rsi })).curve(curveBasis)

    //draw RSI and axis lines
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
                    <p>RSI</p>
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
                        <g className='rsiLine' />
                        <g className='overBoughtOverSold'>
                            <line className='overSold' x1={0} y1={createYScale({ rsiToPixel: 70 })} x2={chartDimensions?.width || 0} y2={createYScale({ rsiToPixel: 70 })} stroke='blue' />
                            <line className='overBought' x1={0} y1={createYScale({ rsiToPixel: 30 })} x2={chartDimensions?.width || 0} y2={createYScale({ rsiToPixel: 30 })} stroke='blue' />
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default RSISubChart