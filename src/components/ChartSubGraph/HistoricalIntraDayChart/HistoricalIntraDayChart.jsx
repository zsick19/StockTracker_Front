import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from '../../../hooks/useResizeObserver'
import { select, drag, zoom, zoomTransform, axisBottom, axisLeft, scaleTime, min, max, line, timeDay, scaleLinear, timeMonths, zoomIdentity, curveLinear, curveBasis, timeFormat } from 'd3'
import { addDays, eachDayOfInterval, getDate, getDay, startOfDay, subBusinessDays, subDays } from 'date-fns'
import { generateIntraDayTickMarks, generateTradingHours, getBreaksBetweenDates } from '../../../Utilities/TimeFrames'
import { discontinuityRange, scaleDiscontinuous } from '@d3fc/d3fc-discontinuous-scale'
import { pixelBuffer } from '../GraphChartConstants'


function HistoricalIntraDayChart({ candleData, tradedTimeStamps, tradePriceTargets, extremes, timeFrame })
{



    //chart plotting necessities
    const preDimensionsAndCandleCheck = () => { return !priceDimensions || !candleDimensions }
    const priceSVG = useRef()
    const candleSVG = useRef()
    const priceSVGWrapper = useRef(null)
    const candleSVGWrapper = useRef(null)
    let priceDimensions = useResizeObserver(priceSVGWrapper)
    let candleDimensions = useResizeObserver(candleSVGWrapper)
    const stockCandleSVG = select(candleSVG.current)
    const priceScaleSVG = select(priceSVG.current)


    //chart zoom states    
    const [enableZoom, setEnableZoom] = useState(true)
    const [chartZoomState, setChartZoomState] = useState({ x: undefined, y: undefined })

    const minPrice = useMemo(() => min(candleData, d => d.LowPrice), [candleData, timeFrame.unitOfIncrement])
    const maxPrice = useMemo(() => max(candleData, d => d.HighPrice), [candleData, timeFrame.unitOfIncrement])


    const dateBetweenStartAndFinishInterval = useMemo(() =>
    {

        if (timeFrame.intraDay)
        {
            let allDays = eachDayOfInterval({ start: subDays(new Date(), 30), end: addDays(new Date(), 30) })
            const businessDays = allDays.filter(day =>
            {
                const dayOfWeek = getDay(day);
                return dayOfWeek !== 0 && dayOfWeek !== 1;
            })
            return businessDays
        }
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
    const excludedPeriods = useMemo(() =>
    {

        if (timeFrame.intraDay) { return generateTradingHours(timeFrame) }
    }, [timeFrame])
    const intraDayTickMarks = useMemo(() =>
    {

        if (timeFrame.intraDay) return generateIntraDayTickMarks(timeFrame)
    }, [timeFrame])


    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const start = startOfDay(subBusinessDays(new Date(), 6))
        let xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuityRange(...excludedPeriods))
            .domain([start, new Date()]).range([0, candleDimensions.width])


        if (chartZoomState?.x)
        {
            const zoomValues = zoomIdentity.translate(chartZoomState.x.x, chartZoomState.x.y).scale(chartZoomState.x.k)
            const newZoomState = zoomValues.rescaleX(xDateScale)
            xDateScale.domain(newZoomState.domain())
        }

        if (pixelToDate !== undefined)
        {
            if (timeFrame.intraDay) { return new Date(Math.floor(xDateScale.invert(pixelToDate))).toISOString() }
            else return xDateScale.invert(pixelToDate).toISOString()
        }
        else if (dateToPixel !== undefined) return xDateScale(new Date(dateToPixel))
        else return xDateScale



    }, [candleData, excludedPeriods, chartZoomState?.x, candleDimensions, timeFrame])

    const createPriceScale = useCallback(({ priceToPixel = undefined, pixelToPrice = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const yScale = scaleLinear()
            .domain([minPrice * 0.95, maxPrice * 1.05])
            .range([candleDimensions.height - pixelBuffer.yDirectionPixelBuffer, 0])
            .interpolate(function (a, b) { const c = b - a; return function (t) { return +(a + t * c).toFixed(2); }; })


        if (chartZoomState?.y)
        {
            const zoomValues = zoomIdentity.translate(chartZoomState.y.x, chartZoomState.y.y).scale(chartZoomState.y.k)
            const newZoomScale = zoomValues.rescaleY(yScale)
            yScale.domain(newZoomScale.domain())
        }

        if (pixelToPrice !== undefined) return Math.round(yScale.invert(pixelToPrice) * 100) / 100
        else if (priceToPixel !== undefined) { return yScale(priceToPixel) }
        else return yScale

    }, [timeFrame, candleData, chartZoomState?.y, priceDimensions])

    //draw visual time breaks
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        let dateVisualSelect = stockCandleSVG.select('.visualDateBreaks')


        dateVisualSelect.selectAll('.visualBreak').remove()
        dateVisualSelect.selectAll('.preMarketVisualBreak').remove()

        dateVisualSelect.selectAll('.dayBreakLine').data(dateBetweenStartAndFinishInterval).join(enter => createDayLineBreaks(enter), update => updateDayLineBreaks(update))
        function createDayLineBreaks(enter)
        {

            enter.each(function (d, i)
            {
                let dateX = createDateScale({ dateToPixel: d })
                dateVisualSelect.append('line').attr('class', `dayBreakLine ${d}`)
                    .attr('x1', dateX).attr('x2', dateX).attr('y1', 0).attr('y2', candleDimensions.height - pixelBuffer.yDirectionPixelBuffer)
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

    }, [candleDimensions, excludedPeriods, chartZoomState?.x, chartZoomState?.y, timeFrame])


    //clean off chart from one timeframe to another
    useEffect(() =>
    {
        stockCandleSVG.select('.x-axis').selectAll('*').remove()
        stockCandleSVG.select('.tickerVal').selectAll('.candlePath').remove()
        stockCandleSVG.select('.morningOpen').selectAll('*').remove()
        stockCandleSVG.select('.lastCandleUpdate').selectAll('.veryLastCandle').remove()
        stockCandleSVG.select('.vwap').selectAll("*").remove()
        stockCandleSVG.select('.emaLines').selectAll("*").remove()
        stockCandleSVG.select('.candleVolumeBars').selectAll('*').remove()
        stockCandleSVG.select('.VP').selectAll('*').remove()
        stockCandleSVG.select('.emaDailyHorizontals').selectAll('*').remove()
        stockCandleSVG.select('.dailyTickerValues').selectAll('*').remove()
        stockCandleSVG.select('.currentPrice').selectAll('*').remove()
        stockCandleSVG.select('.enterExits').selectAll('*').remove()
        stockCandleSVG.select('.freeLines').selectAll('.line_group').remove()
        stockCandleSVG.select('.linesH').selectAll('.line_group').remove()
        stockCandleSVG.select('.lowVolumeNodes').selectAll('.line_group').remove()
        stockCandleSVG.select('.highVolumeNodes').selectAll('.line_group').remove()
        stockCandleSVG.select('.supportResistance').selectAll('.support_Resistance').remove()
        stockCandleSVG.select('.patternPriceLevels').selectAll('*').remove()
        stockCandleSVG.select('.keyLevels').selectAll('*').remove()
        stockCandleSVG.select('.EMNumbers').selectAll('*').remove()
        priceScaleSVG.select('.currentPrice').selectAll("*").remove()
    }, [timeFrame])

    //plot stock candles and scale axis
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return



        const yAxis = axisLeft(createPriceScale())
        priceScaleSVG.select('.y-axis').style('transform', `translateX(${priceDimensions.width - 1}px)`).call(yAxis)


        let xAxis = axisBottom(createDateScale()).tickValues(intraDayTickMarks).tickFormat(timeFormat("%-m/%-d"));
        stockCandleSVG.select('.x-axis').style('transform', `translateY(${candleDimensions.height - pixelBuffer.yDirectionPixelBuffer}px)`).call(xAxis)

        let [minDate, maxDate] = createDateScale().domain()
        const candleDataLength = candleData.length
        const barWidth = Math.max(1, (candleDimensions.width) / candleDataLength)
        let bullishBodies = ''
        let bearishBodies = ''
        let candleWicks = ''
        let churnCandles = []

        if (maxDate < minDate)
        {
            let copyDate = maxDate
            maxDate = minDate
            minDate = copyDate
        }


        for (let i = 0; i < candleDataLength; i++)
        {
            const timeStampDate = new Date(candleData[i].Timestamp)
            if (timeStampDate < minDate || timeStampDate > maxDate) { continue; }
            const d = candleData[i]

            const x = createDateScale({ dateToPixel: d.Timestamp })
            const xCenter = x + barWidth / 2
            const yHigh = createPriceScale({ priceToPixel: d.HighPrice })
            const yLow = createPriceScale({ priceToPixel: d.LowPrice })
            const yOpen = createPriceScale({ priceToPixel: d.OpenPrice })
            const yClose = createPriceScale({ priceToPixel: d.ClosePrice })

            const yTop = Math.min(yOpen, yClose)
            const yBottom = Math.max(yOpen, yClose)


            // Wick string: Move to top of high wick, line down to low wick
            const wickPath = `M${xCenter},${yHigh}V${yLow}`;
            const bodyPath = `M${xCenter},${yTop}V${yBottom}`;

            if ((d?.visualColor === '#FFFF00' || d?.visualColor === '#00FFFF') && differenceInBusinessDays(new Date(), d.Timestamp) < 8) { churnCandles.push(d) }
            else
            {
                if (d.ClosePrice >= d.OpenPrice)
                { bullishBodies += bodyPath }
                else { bearishBodies += bodyPath }
                candleWicks += wickPath
            }

        }

        stockCandleSVG.select('.tickerVal').selectAll('.candlePath').remove()
        const candleGroup = stockCandleSVG.select('.tickerVal').append('g').attr('class', 'candlePath')

        candleGroup.append('path').attr('d', candleWicks).attr('stroke', '#000000')
        candleGroup.append('path').attr('d', bullishBodies).attr('stroke', '#10641b').attr('stroke-width', 2);
        candleGroup.append('path').attr('d', bearishBodies).attr('stroke', '#d40400').attr('stroke-width', 2);

        stockCandleSVG.select('.tickerVal').selectAll('.candle').data(churnCandles)
            .join(enter => createChurnCandles(enter), update => updateChurnCandles(update))

        function createChurnCandles(enter)
        {
            enter.each(function (d, i)
            {
                let xPosition = createDateScale({ dateToPixel: d.Timestamp })
                var tickerGroups = select(this).append('g').attr('class', 'candle')
                tickerGroups.append('line').attr('class', 'lowHigh').attr('stroke', 'black').attr('stroke-width', 1)
                    .attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice }))
                    .attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                    .attr('x1', xPosition)
                    .attr('x2', xPosition)

                tickerGroups.append('line').attr('class', 'openClose')
                    .attr('stroke', (d, i) =>
                    {
                        if (d?.visualColor) return d.visualColor
                        else return d.OpenPrice < d.ClosePrice ? 'green' : 'red'
                    }).attr('stroke-width', 2)
                    .attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice }))
                    .attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
                    .attr('x1', xPosition)
                    .attr('x2', xPosition)


                tickerGroups.append('line').attr('class', 'priceH')
                    .attr('stroke', 'yellow').attr('stroke-width', 0.5)
                    .attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice }))
                    .attr('y2', (d) => createPriceScale({ priceToPixel: d.ClosePrice }))
                    .attr('opacity', 0.5).attr('x1', 0).attr('x2', candleDimensions.width)


            })
        }
        function updateChurnCandles(update)
        {
            update.each(function (d, i)
            {
                const candle = select(this)
                let xPosition = createDateScale({ dateToPixel: d.Timestamp })

                candle.select('.lowHigh')
                    .attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice }))
                    .attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                    .attr('x1', xPosition)
                    .attr('x2', xPosition)
                candle.select('.openClose').attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice }))
                    .attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
                    .attr('x1', xPosition)
                    .attr('x2', xPosition)

                candle.select('.priceH').attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice }))
                    .attr('y2', (d) => createPriceScale({ priceToPixel: d.ClosePrice }))
            })
        }
    }, [candleData, minPrice, maxPrice, excludedPeriods, candleDimensions, chartZoomState?.x, chartZoomState?.y, timeFrame])



    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !tradedTimeStamps) return

        const keyTradeLines = stockCandleSVG.select('.keyLevels')
        keyTradeLines.selectAll('.line_group').remove()

        const entryPixel = createDateScale({ dateToPixel: tradedTimeStamps.EntryTimestamp })
        const lowPixel = createDateScale({ dateToPixel: tradedTimeStamps.LLTimestamp })
        const highPixel = createDateScale({ dateToPixel: tradedTimeStamps.HHTimestamp })

        keyTradeLines.append('line').attr('class', 'line_group').attr('stroke', 'cyan').attr('stroke-width', 1)
            .attr('x1', entryPixel).attr('x2', entryPixel).attr('y1', 0).attr('y2', candleDimensions.height)
        keyTradeLines.append('line').attr('class', 'line_group').attr('stroke', 'red').attr('stroke-width', 1)
            .attr('x1', lowPixel).attr('x2', lowPixel).attr('y1', 0).attr('y2', candleDimensions.height)
        keyTradeLines.append('line').attr('class', 'line_group').attr('stroke', 'green').attr('stroke-width', 1)
            .attr('x1', highPixel).attr('x2', highPixel).attr('y1', 0).attr('y2', candleDimensions.height)

        const enterPricePixel = createPriceScale({ priceToPixel: tradePriceTargets.entryPrice })
        const stopPricePixel = createPriceScale({ priceToPixel: tradePriceTargets.stopLossPrice })
        const exitPricePixel = createPriceScale({ priceToPixel: tradePriceTargets.exitPrice })


        keyTradeLines.append('line').attr('class', 'line_group').attr('stroke', 'cyan').attr('stroke-width', 1)
            .attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', enterPricePixel).attr('y2', enterPricePixel)
        keyTradeLines.append('line').attr('class', 'line_group').attr('stroke', 'green').attr('stroke-width', 1)
            .attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', exitPricePixel).attr('y2', exitPricePixel)
        keyTradeLines.append('line').attr('class', 'line_group').attr('stroke', 'red').attr('stroke-width', 1)
            .attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', stopPricePixel).attr('y2', stopPricePixel)


        const lowPricePixel = createPriceScale({ priceToPixel: extremes.low })
        const highPricePixel = createPriceScale({ priceToPixel: extremes.high })
        keyTradeLines.append('line').attr('class', 'line_group').attr('stroke', 'green').attr('stroke-width', 1)
            .attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', highPricePixel).attr('y2', highPricePixel)
            .attr("stroke-dasharray", '2 2 2')

        keyTradeLines.append('line').attr('class', 'line_group').attr('stroke', 'red').attr('stroke-width', 1)
            .attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', lowPricePixel).attr('y2', lowPricePixel).attr("stroke-dasharray", '2 2 2')




    }, [candleData, tradedTimeStamps, candleDimensions, chartZoomState?.x, chartZoomState?.y])











    return (
        <div className='SVGGraphWrapper'>

            <div ref={priceSVGWrapper} className='priceSVGWrapper'>
                <svg ref={priceSVG}>
                    <g className='y-axis' />
                    <g className='currentPrice' />
                </svg>
            </div>

            <div ref={candleSVGWrapper} className='dateSVGWrapper'>
                <svg ref={candleSVG}>
                    <defs>
                        <linearGradient id="fadeLowVolume" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="blue" stopOpacity="0" />
                            <stop offset="75%" stopColor="blue" stopOpacity="1" />
                            <stop offset="100%" stopColor="blue" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="fadeHighVolume" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="green" stopOpacity="0" />
                            <stop offset="75%" stopColor="green" stopOpacity="1" />
                            <stop offset="100%" stopColor="green" stopOpacity="1" />
                        </linearGradient>

                        <linearGradient id="zoneBearish" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="yellow" stopOpacity="1" />
                            <stop offset="80%" stopColor="yellow" stopOpacity=".75" />
                            <stop offset="100%" stopColor="red" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="zoneBullish" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="blue" stopOpacity="1" />
                            <stop offset="90%" stopColor="yellow" stopOpacity="1" />
                            <stop offset="100%" stopColor="yellow" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <g className='x-axis' />
                    <g className='visualDateBreaks' />
                    <g className='patternPriceLevels' />
                    <g className='lowVolumeNodes' />
                    <g className='highVolumeNodes' />
                    <g className='keyLevels' />
                    <g className='morningOpen' />
                    <g className='initialTrack' />
                    <g className='enterExits' />
                    <g className='supportResistance' />
                    <g className='dailyTickerValues' />
                    <g className='emaDailyHorizontals' />
                    <g className='tickerVal' />
                    <g className='candleVolumeBars' />
                    <g className='lastCandleUpdate' />
                    <g className='crossHairs' >
                        <line className='crossY' strokeWidth='0.5px' stroke='black'></line>
                        <line className='crossX' strokeWidth='0.5px' stroke='black'></line>
                        <text className='priceY'></text>
                    </g>
                    <g className='temp' />
                    <g className='emaLines' />
                    <g className='vwap'>
                        <path className='vwapLine' />
                    </g>
                    <g className='volumeProfile' />
                    <g className='VP' />
                    <g className='freeLines' />
                    <g className='linesH' />
                    <g className='trendLines' />
                    <g className='EMNumbers' />
                    <g className='relevantHigh' />
                    <g className='relevantLow' />
                    <g className='relevantInstitutional' />

                    <g className='currentPrice' />
                </svg>
            </div>
        </div>
    )

}

export default HistoricalIntraDayChart