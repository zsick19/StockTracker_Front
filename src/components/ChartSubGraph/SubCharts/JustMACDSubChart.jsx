import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from '../../../hooks/useResizeObserver'
import { calculateMACDOptimized, calculateYAxisRange, MACDCalc, rsiCalc } from '../../../Utilities/technicalIndicatorFunctions'
import { addDays, addMinutes, addYears, eachDayOfInterval, isSaturday, isSunday, sub, subDays, subMonths } from 'date-fns'
import { axisBottom, axisLeft, curveBasis, line, scaleLinear, scaleTime, select, selectAll, svg, timeDay, timeMonths, zoom, zoomIdentity, zoomTransform } from 'd3'
import { discontinuityRange, discontinuitySkipUtcWeekends, discontinuitySkipWeekends, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'
// import { makeSelectZoomStateByUUID } from '../../../features/Charting/GraphHoverZoomElement'
import { useSelector } from 'react-redux'
// import { generateTradingHours, getBreaksBetweenDates, provideStartAndEndDatesForDateScale } from '../../../Utilities/TimeFrames'
import { makeSelectGraphHoursByUUID } from '../../../features/Charting/GraphMarketHourElement'
import { pixelBuffer } from '../GraphChartConstants'
import { generateTradingHours, provideStartAndEndDatesForDateScale } from '../../../Utilities/TimeFrames'
import { makeSelectZoomStateByUUID } from '../../../features/Charting/GraphHoverZoomElement'
import { makeSelectGraphStudyByUUID } from '../../../features/Charting/GraphStudiesVisualElement'
import { makeSelectGraphCrossHairsByUUID } from '../../../features/Charting/GraphToSubGraphCrossHairElement'



function JustMACDSubChart({ candleData, uuid, setShowMACD, timeFrame, hideTimeLine, liveActionTimeFrame })
{
    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const chartDimensions = useResizeObserver(XSVG)
    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }

    const MACDData = useMemo(() => calculateMACDOptimized(candleData), [candleData.length])
    const MACDRange = useMemo(() => calculateYAxisRange(MACDData), [])



    const selectedChartZoomStateMemo = useMemo(makeSelectZoomStateByUUID, [])
    const chartZoomState = useSelector(state => selectedChartZoomStateMemo(state, uuid))


    // const selectCurrentXCrossHair = useMemo(makeSelectGraphCrossHairsByUUID, [])
    // const currentCrossHairX = useSelector(state => selectCurrentXCrossHair(state, uuid))


    const selectDisplayMarketHoursMemo = useMemo(makeSelectGraphHoursByUUID, [])
    const displayMarketHours = useSelector((state) => selectDisplayMarketHoursMemo(state, uuid))

    const excludedPeriods = useMemo(() => generateTradingHours(timeFrame, displayMarketHours?.showOnlyIntraDay), [timeFrame, displayMarketHours?.showOnlyIntraDay])



    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        let xDateScale

        if (liveActionTimeFrame)
        {
            let start = new Date()
            start.setHours(9, 25)
            let end = addMinutes(new Date(), 15)
            xDateScale = scaleTime().domain([start, end]).range([0, chartDimensions.width])
        } else
        {
            const startEndDate = provideStartAndEndDatesForDateScale(timeFrame, displayMarketHours?.focusDates)

            xDateScale = scaleTime().domain([startEndDate.startDate, startEndDate.futureForwardEndDate]).range([0, chartDimensions.width])
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


    // const yPixelBufferBottom = hideTimeLine ? 0 : 20
    // const yPixelBufferTop = hideTimeLine ? 5 : 10
    const createYScale = useCallback(({ MACDToPixel = undefined, pixelToMACD = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return


        const yScale = scaleLinear().domain([MACDRange.min, MACDRange.max]).range([chartDimensions.height, 0])



        if (MACDToPixel !== undefined) return yScale(MACDToPixel)
        else return yScale
    }, [candleData, chartDimensions])

    const createHistogramYScale = useCallback(({ histogramToPixel = undefined, pixelToHistogram = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck() || !MACDRange) return
        const yScale = scaleLinear().domain([MACDRange.histogramExtremes[0], MACDRange.histogramExtremes[1]])
            .range([20, chartDimensions.height - 20])

        if (histogramToPixel !== undefined) return yScale(histogramToPixel)
        else return yScale

    }, [MACDRange, candleData, chartDimensions])










    const macdLine = line().x((d, i) => createDateScale({ dateToPixel: d.Timestamp })).y(d => createYScale({ MACDToPixel: d.macd }))
    const signalLine = line().x((d, i) => createDateScale({ dateToPixel: d.Timestamp })).y(d => createYScale({ MACDToPixel: d.signal }))

    const svg = select(XSVG.current)
    //draw MACD Lines
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

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

        const barWidth = Math.max(1, (chartDimensions.width) / MACDData.length);

        // 4. Custom generator function to sew 1,440 bars into ONE path string
        function generateHistogramPath(data)
        {
            let pathString = "";

            for (let i = 0; i < data.length; i++)
            {
                const d = data[i];
                const x = createDateScale({ dateToPixel: d.Timestamp });
                const y = createHistogramYScale({ histogramToPixel: d.histogram });
                let yZero = createYScale({ MACDToPixel: 0 })
                // Build the bounding coordinates for a single bar
                // Move to bottom-left -> Line to top-left -> Line to top-right -> Line to bottom-right -> Close
                pathString += `M${x},${yZero} L${x},${y} L${x + barWidth},${y} L${x + barWidth},${yZero} Z `;
            }
            return pathString;
        }

        const positiveData = MACDData.filter(d => d.histogram >= 0);
        svg.select('.histogramLine').selectAll('.hist-pos')
            .data([positiveData]) // Wrap in an array so D3 binds the full set to one element
            .join(
                enter => enter.append("path").attr("class", "hist-pos"),
                update => update,
                exit => exit.remove()
            )
            .attr("d", generateHistogramPath)
            .attr("fill", "#075f0e"); // TradingView style green

        const negativeData = MACDData.filter(d => d.histogram < 0);

        svg.select('.histogramLine').selectAll('.hist-neg')
            .data([negativeData])
            .join(
                enter => enter.append("path").attr("class", "hist-neg"),
                update => update,
                exit => exit.remove()
            )
            .attr("d", generateHistogramPath)
            .attr("fill", "#b80b08"); // TradingView style red

    }, [MACDData, excludedPeriods, chartZoomState?.x, chartDimensions])


    // //draw visual time breaks
    // useEffect(() =>
    // {
    //     if (preDimensionsAndCandleCheck()) return
    //     let dateVisualSelect = svg.select('.visualDateBreaks')
    //     if (timeFrame.intraDay && !displayMarketHours.showOnlyIntraDay)
    //     {
    //         dateVisualSelect.selectAll('.visualBreak').remove()
    //         dateVisualSelect.selectAll('.dayBreakLine').remove()
    //         dateVisualSelect.selectAll('.preMarketVisualBreak').data([...visualBreaksPeriods.preMarket]).join(enter => createMarketOpenVisualBreaks(enter), update => updateMarketOpenVisualBreaks(update))
    //         function createMarketOpenVisualBreaks(enter)
    //         {
    //             enter.each(function (d, i)
    //             {
    //                 let start = createDateScale({ dateToPixel: d })
    //                 let marketClose = createDateScale({ dateToPixel: visualBreaksPeriods.marketClose[i] })
    //                 var visualBreakGroups = select(this).append('g').attr('class', 'preMarketVisualBreak')

    //                 visualBreakGroups.append('rect').attr('class', 'preMarket')
    //                     .attr('x', (d, i) => start).attr('y', -pixelBuffer.yDirectionPixelBuffer)
    //                     .attr('width', (d) => createDateScale({ dateToPixel: visualBreaksPeriods.preMarketEnd[i] }) - start)
    //                     .attr('height', chartDimensions.height)


    //                 visualBreakGroups.append('rect').attr('class', 'afterMarket')
    //                     .attr('x', (d, i) => marketClose).attr('y', -pixelBuffer.yDirectionPixelBuffer)
    //                     .attr('width', (d) => createDateScale({ dateToPixel: visualBreaksPeriods.afterMarket[i] }) - marketClose)
    //                     .attr('height', chartDimensions.height)
    //             })
    //         }
    //         function updateMarketOpenVisualBreaks(update)
    //         {
    //             update.each(function (d, i)
    //             {
    //                 let start = createDateScale({ dateToPixel: d })
    //                 let marketClose = createDateScale({ dateToPixel: visualBreaksPeriods.marketClose[i] })

    //                 const visualBreakGroups = select(this)
    //                 visualBreakGroups.select('.preMarket').attr('x', createDateScale({ dateToPixel: d })).attr('y', -pixelBuffer.yDirectionPixelBuffer).attr('width', (d) => createDateScale({ dateToPixel: visualBreaksPeriods.preMarketEnd[i] }) - start)
    //                 visualBreakGroups.select('.afterMarket').attr('x', marketClose).attr('y', -pixelBuffer.yDirectionPixelBuffer)
    //                     .attr('width', (d) => createDateScale({ dateToPixel: visualBreaksPeriods.afterMarket[i] }) - marketClose)
    //             })
    //         }
    //     }
    //     else if (timeFrame.intraDay && displayMarketHours.showOnlyIntraDay)
    //     {
    //         dateVisualSelect.selectAll('.visualBreak').remove()
    //         dateVisualSelect.selectAll('.preMarketVisualBreak').remove()

    //         dateVisualSelect.selectAll('.dayBreakLine').data(dateBetweenStartAndFinishInterval).join(enter => createDayLineBreaks(enter), update => updateDayLineBreaks(update))
    //         function createDayLineBreaks(enter)
    //         {
    //             enter.each(function (d, i)
    //             {
    //                 let dateX = createDateScale({ dateToPixel: d })
    //                 dateVisualSelect.append('line').attr('class', 'dayBreakLine')
    //                     .attr('x1', dateX).attr('x2', dateX).attr('y1', 0).attr('y2', chartDimensions.height - pixelBuffer.yDirectionPixelBuffer)
    //                     .attr('stroke', 'blue').attr('stroke-width', '1px')
    //             })
    //         }
    //         function updateDayLineBreaks(update)
    //         {
    //             update.each(function (d, i)
    //             {
    //                 let updateDateX = createDateScale({ dateToPixel: d })
    //                 select(this).attr('x1', updateDateX).attr('x2', updateDateX)
    //             })
    //         }
    //     }
    //     else if (!timeDay.intraDay)
    //     {
    //         dateVisualSelect.selectAll('.dayBreakLine').remove()
    //         dateVisualSelect.selectAll('.preMarketVisualBreak').remove()
    //         dateVisualSelect.selectAll('.visualBreak').remove()
    //         let pixelDates = visualBreaksPeriods.months.map((d) => createDateScale({ dateToPixel: d }))
    //         dateVisualSelect.selectAll('.visualBreak').data(visualBreaksPeriods.months).join(enter => createVisualBreaks(enter))
    //         function createVisualBreaks(enter)
    //         {
    //             enter.append('rect').attr('class', (d, i) => { return i % 2 !== 0 ? 'monthOdd visualBreak' : 'monthEven visualBreak' })
    //                 .attr('x', (d, i) => createDateScale({ dateToPixel: d })).attr('y', hideTimeLine ? 5 : -pixelBuffer.yDirectionPixelBuffer)
    //                 .attr('width', (d, i) => { return pixelDates[i + 1] - createDateScale({ dateToPixel: d }) })
    //                 .attr('height', chartDimensions.height)
    //         }
    //     }
    // }, [chartDimensions, excludedPeriods, chartZoomState?.x, timeFrame])

    // //draw crosshair 
    // useEffect(() =>
    // {
    //     if (preDimensionsAndCandleCheck()) return
    //     const svg = select(XSVG.current)

    //     if (currentCrossHairX?.x)
    //     {
    //         svg.select('.crossHair').select('.yTrace').attr('x1', currentCrossHairX.x).attr('x2', currentCrossHairX.x)
    //             .attr('y1', 0).attr('y2', chartDimensions.height).attr('stroke', 'black').attr('stroke-width', '1px')
    //             .attr('visibility', 'visible')
    //     } else
    //     {
    //         svg.select('.crossHair').select('.yTrace').attr('visibility', 'hidden')
    //     }
    // }, [currentCrossHairX])



    return (


        <div ref={XSVGWrapper} className='justMACDSubChart' onClick={() => setShowMACD(false)} >
            <svg ref={XSVG} >
                <g className='x-axis' />
                <g className='visualDateBreaks' />
                <g className='histogramLine' opacity={0.75} />
                <g className='crossHair'>
                    <line className='yTrace' />
                </g>
                <g className='macdLine' />
                <g className='zeroLine'>
                    <line className='zeroLine' x1={-10000} x2={10000}
                        y1={createYScale({ MACDToPixel: 0 })} y2={createYScale({ MACDToPixel: 0 })} stroke='black' strokeWidth={'0.5px'} />
                </g>
            </svg>
        </div>
    )
}


export default JustMACDSubChart