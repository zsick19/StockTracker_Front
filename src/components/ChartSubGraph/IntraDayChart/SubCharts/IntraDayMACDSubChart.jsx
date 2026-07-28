import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// import { calculateYAxisRange, MACDCalc, rsiCalc } from '../../../Utilities/technicalIndicatorFunctions'
import { addBusinessDays, addDays, addYears, eachDayOfInterval, isSaturday, isSunday, sub, subBusinessDays, subDays, subMonths } from 'date-fns'
import { axisBottom, axisLeft, curveBasis, line, scaleLinear, scaleTime, select, selectAll, svg, timeDay, timeMonths, zoom, zoomIdentity, zoomTransform } from 'd3'
import { discontinuityRange, discontinuitySkipUtcWeekends, discontinuitySkipWeekends, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'
// import { makeSelectZoomStateByUUID } from '../../../features/Charting/GraphHoverZoomElement'
import { useSelector } from 'react-redux'
// import { generateTradingHours, getBreaksBetweenDates, provideStartAndEndDatesForDateScale } from '../../../Utilities/TimeFrames'
// import { makeSelectGraphCrossHairsByUUID } from '../../../features/Charting/GraphToSubGraphCrossHairElement'
// import { makeSelectGraphHoursByUUID } from '../../../features/Charting/GraphMarketHourElement'
// import { pixelBuffer } from '../GraphChartConstants'
import { useResizeObserver } from '../../../../hooks/useResizeObserver'
import { generateIntraDayTickMarksBetweenTwoDates, generateMarketTradingHoursBetweenTwoDates, getBreaksBetweenDates } from '../../../../Utilities/TimeFrames'
import { calculateYAxisRange, MACDCalc } from '../../../../Utilities/technicalIndicatorFunctions'
import { pixelBuffer } from '../../GraphChartConstants'

function IntraDayMACDSubChart({ candleData, currentCrossHairX, uuid, timeFrame, hideTimeLine, chartStartDate, chartZoomState, setChartZoomState })
{
    const YSVGWrapper = useRef()
    const YSVG = useRef()
    const XSVGWrapper = useRef()
    const XSVG = useRef()
    const yScaleDimensions = useResizeObserver(YSVG)
    const chartDimensions = useResizeObserver(XSVG)
    const preDimensionsAndCandleCheck = () => { return (!chartDimensions) }

    const MACDData = useMemo(() => calculateMACD(candleData), [candleData])
    const MACDRange = useMemo(() => calculateYAxisRange(MACDData.slice(MACDData.length - 50)), [MACDData])

    const dateBetweenStartAndFinishInterval = useMemo(() => eachDayOfInterval({ start: chartStartDate, end: addBusinessDays(new Date(), 1) }), [chartStartDate])
    const visualBreaksPeriods = useMemo(() => getBreaksBetweenDates(subBusinessDays(chartStartDate, 1), new Date(), 'days'), [chartStartDate])
    const excludedPeriods = useMemo(() => generateMarketTradingHoursBetweenTwoDates(subBusinessDays(chartStartDate, 1), new Date()), [chartStartDate])
    const intraDayTickMarks = useMemo(() => generateIntraDayTickMarksBetweenTwoDates(subBusinessDays(chartStartDate, 1), addBusinessDays(new Date(), 1)), [chartStartDate])


    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return


        let xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuityRange(...excludedPeriods))
            .domain([subBusinessDays(chartStartDate, 1), addBusinessDays(new Date(), 1)]).range([0, chartDimensions.width])

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

    const [yZoomState, setYZoomState] = useState(undefined)

    const yPixelBufferBottom = hideTimeLine ? 0 : 20
    const yPixelBufferTop = hideTimeLine ? 5 : 10
    const createYScale = useCallback(({ MACDToPixel = undefined, pixelToMACD = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return


        const yScale = scaleLinear().domain([MACDRange.min, MACDRange.max]).range([chartDimensions.height - yPixelBufferBottom, yPixelBufferTop])

        if (yZoomState)
        {
            const zoomValues = zoomIdentity.translate(yZoomState.x, yZoomState.y).scale(yZoomState.k)
            const newZoomState = zoomValues.rescaleX(yScale)
            yScale.domain(newZoomState.domain())
        }



        if (pixelToMACD !== undefined) return Math.round(yScale.invert(pixelToMACD) * 100) / 100
        if (MACDToPixel !== undefined) return yScale(MACDToPixel)

        else return yScale

    }, [candleData, yZoomState, chartDimensions])

    const createHistogramYScale = useCallback(({ histogramToPixel = undefined, pixelToHistogram = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck() || !MACDRange) return
        const yScale = scaleLinear().domain([MACDRange.histogramExtremes[0], MACDRange.histogramExtremes[1]])
            .range([20, chartDimensions.height - 20])

        if (yZoomState)
        {
            const zoomValues = zoomIdentity.translate(yZoomState.x, yZoomState.y).scale(yZoomState.k)
            const newZoomState = zoomValues.rescaleX(yScale)
            yScale.domain(newZoomState.domain())
        }



        if (pixelToHistogram !== undefined) return Math.round(yScale.invert(pixelToHistogram) * 100) / 100
        if (histogramToPixel !== undefined) return yScale(histogramToPixel)
        else return yScale

    }, [MACDRange, candleData, chartDimensions])








    const macdLine = line().x((d, i) => createDateScale({ dateToPixel: d.Timestamp })).y(d => createYScale({ MACDToPixel: d.macd })).curve(curveBasis)
    const signalLine = line().x((d, i) => createDateScale({ dateToPixel: d.Timestamp })).y(d => createYScale({ MACDToPixel: d.signal })).curve(curveBasis)

    const svg = select(XSVG.current)
    // //draw MACD Lines
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

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

        function generateHistogramPath(data)
        {
            let pathString = "";
            for (let i = 0; i < data.length; i++)
            {
                const d = data[i];
                const x = createDateScale({ dateToPixel: d.Timestamp }) - (barWidth / 2);
                const y = createHistogramYScale({ histogramToPixel: -d.histogram });
                let yZero = createYScale({ MACDToPixel: 0 })
                pathString += `M${x},${yZero} L${x},${y} L${x + barWidth},${y} L${x + barWidth},${yZero} Z `;
            }
            return pathString;
        }

        const positiveData = MACDData.filter(d => d.histogram >= 0);
        svg.select('.histogramLine').selectAll('.hist-pos')
            .data([positiveData])
            .join(enter => enter.append("path").attr("class", "hist-pos"), update => update, exit => exit.remove())
            .attr("d", generateHistogramPath)
            .attr("fill", "#075f0e");

        const negativeData = MACDData.filter(d => d.histogram < 0);
        svg.select('.histogramLine').selectAll('.hist-neg')
            .data([negativeData])
            .join(enter => enter.append("path").attr("class", "hist-neg"), update => update, exit => exit.remove())
            .attr("d", generateHistogramPath)
            .attr("fill", "#b80b08");


    }, [candleData, yZoomState, excludedPeriods, chartZoomState?.x, chartDimensions])


    //plot day line breaks
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

    // //draw crosshair 
    // useEffect(() =>
    // {
    //     if (preDimensionsAndCandleCheck()) return
    //     const svg = select(XSVG.current)
    //     console.log(currentCrossHairX)
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

    // //zoomYBehavior
    // useEffect(() =>
    // {
    //     if (preDimensionsAndCandleCheck()) return
    //     const yScaleSVG = select(YSVG.current)
    //     const zoomBehavior = zoom().on('zoom', () =>
    //     {
    //         const zoomState = zoomTransform(yScaleSVG.node())
    //         setYZoomState({ x: zoomState.x, y: zoomState.y, k: zoomState.k })
    //     })

    //     yScaleSVG.call(zoomBehavior)



    // }, [candleData, chartZoomState, yScaleDimensions, timeFrame])



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
                        <g className='histogramLine' />
                        <g className='crossHair'>
                            <line className='yTrace' />
                        </g>
                        <g className='macdLine' />
                        <g className='zeroLine'>
                            <line className='zeroLine' x1={-10000} x2={10000} y1={createYScale({ MACDToPixel: 0 })} y2={createYScale({ MACDToPixel: 0 })} stroke='black' strokeWidth={'0.5px'} />
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default IntraDayMACDSubChart

function calculateMACD(data, closeKey = 'ClosePrice', fastPeriod = 12, slowPeriod = 26, signalPeriod = 9)
{
    // Helper function to calculate EMA for an array of numbers
    function calculateEMA(values, period)
    {
        const ema = [];
        const k = 2 / (period + 1);

        // Use the simple moving average (SMA) of the first 'period' elements as the initial EMA value
        let sum = 0;
        for (let i = 0; i < period; i++)
        {
            sum += values[i];
        }
        let currentEma = sum / period;
        ema[period - 1] = currentEma;

        // Calculate subsequent EMA values recursively
        for (let i = period; i < values.length; i++)
        {
            currentEma = (values[i] * k) + (currentEma * (1 - k));
            ema[i] = currentEma;
        }
        return ema;
    }

    // Extract closing prices from the candlestick objects
    const closes = data.map(candle => candle[closeKey]);

    if (closes.length < slowPeriod + signalPeriod)
    {
        return []
    }

    // 1. Calculate Fast and Slow EMAs
    const fastEma = calculateEMA(closes, fastPeriod);
    const slowEma = calculateEMA(closes, slowPeriod);

    // 2. Calculate MACD Line (Fast EMA - Slow EMA)
    const macdLine = [];
    for (let i = 0; i < closes.length; i++)
    {
        if (fastEma[i] !== undefined && slowEma[i] !== undefined)
        {
            macdLine[i] = fastEma[i] - slowEma[i];
        } else
        {
            macdLine[i] = undefined; // Fill initial empty periods
        }
    }

    // Filter out undefined values to calculate the Signal Line EMA accurately
    const validMacdValues = macdLine.filter(val => val !== undefined);
    const signalEma = calculateEMA(validMacdValues, signalPeriod);

    // Shift the Signal Line array back to align with the original data lengths
    const shiftOffset = slowPeriod - 1;
    const macdSignal = new Array(shiftOffset).fill(undefined).concat(signalEma);

    // 3. Map everything back to the original candlestick objects
    return data.map((candle, idx) =>
    {
        const macd = macdLine[idx];
        const signal = macdSignal[idx];
        const hist = (macd !== undefined && signal !== undefined) ? (macd - signal) : undefined;


        return {
            Timestamp: candle.Timestamp,
            macd: macd !== undefined ? Number(macd.toFixed(4)) : 0,
            signal: signal !== undefined ? Number(signal.toFixed(4)) : 0,
            histogram: hist !== undefined ? Number(hist.toFixed(4)) : 0
        };
    });
}