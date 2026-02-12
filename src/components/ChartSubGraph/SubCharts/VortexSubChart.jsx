import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useResizeObserver } from '../../../hooks/useResizeObserver'
import { useSelector } from 'react-redux'
import { makeSelectZoomStateByUUID } from '../../../features/Charting/GraphHoverZoomElement'
import { makeSelectGraphCrossHairsByUUID } from '../../../features/Charting/GraphToSubGraphCrossHairElement'
import { generateTradingHours, provideStartAndEndDatesForDateScale } from '../../../Utilities/TimeFrames'
import { addDays, isSaturday, isSunday, sub, subDays, subMonths } from 'date-fns'
import { discontinuityRange, discontinuitySkipUtcWeekends, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'
import { axisBottom, axisLeft, curveBasis, line, scaleLinear, scaleTime, select, selectAll, timeDay, timeMonths, zoomIdentity } from 'd3'
import { calculateVortex } from '../../../Utilities/technicalIndicatorFunctions'
import { makeSelectGraphHoursByUUID } from '../../../features/Charting/GraphMarketHourElement'

function VortexSubChart({ candleData, uuid, timeFrame })
{

    let periodBlock = 14
    const YSVGWrapper = useRef()
    const YSVG = useRef()
    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const yScaleDimensions = useResizeObserver(YSVG)
    const chartDimensions = useResizeObserver(XSVG)
    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }
    const vortexData = useMemo(() => calculateVortex(candleData, 14), [candleData])

    const selectedChartZoomStateMemo = useMemo(makeSelectZoomStateByUUID, [])
    const chartZoomState = useSelector(state => selectedChartZoomStateMemo(state, uuid))

    const selectCurrentXCrossHair = useMemo(makeSelectGraphCrossHairsByUUID, [])
    const currentCrossHairX = useSelector(state => selectCurrentXCrossHair(state, uuid))

    const selectDisplayMarketHoursMemo = useMemo(makeSelectGraphHoursByUUID, [])
    const displayMarketHours = useSelector((state) => selectDisplayMarketHoursMemo(state, uuid))

    const excludedPeriods = useMemo(() => { if (timeFrame.intraDay) return generateTradingHours(timeFrame, displayMarketHours?.showOnlyIntraDay) }, [timeFrame, displayMarketHours?.showOnlyIntraDay])


    const yPixelBufferBottom = 20
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

    }, [candleData, chartZoomState?.x, chartDimensions])

    // const yPixelBufferBottom = 20
    const createYScale = useCallback(({ vortexToPixel = undefined, pixelToVortex = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const yPixelBufferTop = 10

        const yScale = scaleLinear()
            .domain([0, 1.6])
            .range([chartDimensions.height - yPixelBufferBottom, yPixelBufferTop])

        if (pixelToVortex !== undefined) return Math.round(yScale.invert(pixelToVortex) * 100) / 100
        if (vortexToPixel !== undefined) return yScale(vortexToPixel)

        else return yScale


    }, [candleData, chartDimensions])

    const VILine = line().x(d => createDateScale({ dateToPixel: d.date })).y(d => createYScale({ vortexToPixel: d.value })).curve(curveBasis)



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

        const vortex = svg.select('.vortex')
        vortex.selectAll('.vortexLinePlus').data([vortexData.vortexIndicatorPlus]).join((enter) => createVortexPlus(enter), update => updateVortexPlus(update))

        function createVortexPlus(enter)
        {
            enter.append('path').attr('class', 'vortexLinePlus').attr('d', d => VILine(d)).attr('stroke', 'orange').attr('fill', 'none')
        }
        function updateVortexPlus(update)
        {
            vortex.select('.vortexLinePlus').attr('d', d => VILine(d))
        }

        vortex.selectAll('.vortexLineMinus').data([vortexData.vortexIndicatorMinus]).join((enter) => createVortexMinus(enter), update => updateVortexMinus(update))
        function createVortexMinus(enter)
        {
            enter.append('path').attr('class', 'vortexLineMinus').attr('d', d => VILine(d)).attr('stroke', 'blue').attr('fill', 'none')
        }
        function updateVortexMinus(update)
        {
            vortex.select('.vortexLineMinus').attr('d', d => VILine(d))
        }





    }, [candleData, chartZoomState.x, chartDimensions])

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
                    <p>VORTEX</p>
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

                        <g className='vortex' />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default VortexSubChart


