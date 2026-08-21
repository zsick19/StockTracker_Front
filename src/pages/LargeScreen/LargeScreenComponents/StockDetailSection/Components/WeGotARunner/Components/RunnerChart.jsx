import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from '../../../../../../../hooks/useResizeObserver'
import { scaleDiscontinuous, discontinuityRange, discontinuitySkipUtcWeekends } from '@d3fc/d3fc-discontinuous-scale'
import { addDays, isToday, subMonths, addYears, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, eachDayOfInterval, getDay, addHours, addMinutes, differenceInBusinessDays, set, isWeekend, previousFriday, subBusinessDays, addBusinessDays, eachWeekOfInterval, endOfDay, startOfDay, subMinutes } from 'date-fns'
import { select, drag, zoom, zoomTransform, axisBottom, axisLeft, scaleTime, min, max, line, timeDay, scaleLinear, timeMonths, zoomIdentity, curveLinear, curveBasis, timeFormat } from 'd3'
import { pixelBuffer } from '../../../../../../../components/ChartSubGraph/GraphChartConstants'
import { useSelector } from 'react-redux'
import { makeSelectNewsRunnerCandlesById, makeSelectNewsRunnerMostRecentCandleById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import { preSetDailyTimes } from '../../../../../../../Utilities/TimeFrames'
import { MinuteMacdChart } from './MinuteMacdChart'


function RunnerChart({ ticker })
{
    const selectMostRecentCandle = useMemo(makeSelectNewsRunnerMostRecentCandleById, [ticker])
    const mostRecentCandle = useSelector((state) => selectMostRecentCandle(state, ticker))

    const selectNewsRunnerCandle = useMemo(makeSelectNewsRunnerCandlesById, [ticker])
    const { candleData, originalPrice, articlePublishDate } = useSelector((state) => selectNewsRunnerCandle(state, ticker))


    const [chartZoomState, setChartZoomState] = useState({ x: undefined, y: undefined })
    const priceSVG = useRef()
    const candleSVG = useRef()
    const priceSVGWrapper = useRef(null)
    const candleSVGWrapper = useRef(null)
    let priceDimensions = useResizeObserver(priceSVGWrapper)
    let candleDimensions = useResizeObserver(candleSVGWrapper)
    const stockCandleSVG = select(candleSVG.current)
    const priceScaleSVG = select(priceSVG.current)





    const preDimensionsAndCandleCheck = () => { return !priceDimensions || !candleDimensions }


    //chart scale creation
    const minPrice = useMemo(() => min(candleData, d => d.LowPrice), [ticker, candleData])
    const maxPrice = useMemo(() => max(candleData, d => d.HighPrice), [ticker, candleData])

    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck() || candleData.length === 0) return

        let start = subMinutes(new Date(), 15)

        let xDateScale = scaleTime().domain([start, addMinutes(new Date(), 25)]).range([0, candleDimensions.width])

        if (chartZoomState?.x)
        {
            const zoomValues = zoomIdentity.translate(chartZoomState.x.x, chartZoomState.x.y).scale(chartZoomState.x.k)
            const newZoomState = zoomValues.rescaleX(xDateScale)
            xDateScale.domain(newZoomState.domain())
        }

        if (pixelToDate !== undefined) return new Date(Math.floor(xDateScale.invert(pixelToDate))).toISOString()
        else if (dateToPixel !== undefined) return xDateScale(new Date(dateToPixel))
        else return xDateScale

    }, [candleData, chartZoomState?.x, candleDimensions])


    const createPriceScale = useCallback(({ priceToPixel = undefined, pixelToPrice = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const yScale = scaleLinear()
            .domain([minPrice * 0.98, maxPrice * 1.02])
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


    }, [candleData, chartZoomState?.y, priceDimensions])

    useEffect(() => { setChartZoomState({ x: undefined, y: undefined }) }, [ticker])

    //plot stock candles and scale axis
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || candleData.length === 0) return

        const xAxis = axisBottom(createDateScale())
        // .tickValues(intraDayTickMarks)
        // .tickFormat(timeFormat("%-m/%-d"));
        stockCandleSVG.select('.x-axis').style('transform', `translateY(${candleDimensions.height - pixelBuffer.yDirectionPixelBuffer}px)`).call(xAxis)

        const yAxis = axisLeft(createPriceScale())
        priceScaleSVG.select('.y-axis').style('transform', `translateX(${priceDimensions.width - 1}px)`).call(yAxis)



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
            //const timeStampDate = new Date(candleData[i].Timestamp)
            // if (timeStampDate < minDate || timeStampDate > maxDate) { continue; }
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

            if (d.ClosePrice >= d.OpenPrice) { bullishBodies += bodyPath }
            else { bearishBodies += bodyPath }

            candleWicks += wickPath
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
    }, [candleData, minPrice, maxPrice, candleDimensions, chartZoomState?.x, chartZoomState?.y])


    //plot most recent candle data and live price
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !mostRecentCandle || !candleData.length > 0) return
        let centerTextOnPriceLinePixel = 5
        let centerRectOnPriceLinePixel = 15
        let priceOnYScale = priceScaleSVG.select('.currentPrice')
        priceOnYScale.selectAll('*').remove()
        let lastCandleDataTimeStampPlusOneMin = candleData.length > 0 ? addMinutes(candleData[candleData.length - 1].Timestamp, 1) : new Date()


        let tickerGroups = stockCandleSVG.select('.lastCandleUpdate')
        tickerGroups.selectAll('*').remove()

        tickerGroups.append('line').attr('stroke', 'black').attr('stroke-width', 1)
            .attr('y1', (d) => createPriceScale({ priceToPixel: mostRecentCandle.LowPrice }))
            .attr('y2', (d) => createPriceScale({ priceToPixel: mostRecentCandle.HighPrice }))
            .attr('x1', (d) => createDateScale({ dateToPixel: lastCandleDataTimeStampPlusOneMin }))
            .attr('x2', (d) => createDateScale({ dateToPixel: lastCandleDataTimeStampPlusOneMin }))

        tickerGroups.append('line').attr('stroke', (d, i) => { return mostRecentCandle.OpenPrice < mostRecentCandle.ClosePrice ? 'green' : 'red' }).attr('stroke-width', 2)
            .attr('y1', (d) => createPriceScale({ priceToPixel: mostRecentCandle.ClosePrice }))
            .attr('y2', (d) => createPriceScale({ priceToPixel: mostRecentCandle.OpenPrice }))
            .attr('x1', (d) => createDateScale({ dateToPixel: lastCandleDataTimeStampPlusOneMin }))
            .attr('x2', (d) => createDateScale({ dateToPixel: lastCandleDataTimeStampPlusOneMin }))

        let pixelPrice = createPriceScale({ priceToPixel: mostRecentCandle.ClosePrice })
        tickerGroups.append('line').attr('class', 'livePrice')
            .attr('x1', -5000).attr('x2', candleDimensions.width)
            .attr('y1', pixelPrice).attr('y2', pixelPrice)
            .attr('stroke', 'green')
            .attr('stroke-width', '1px')
            .attr('stroke-dasharray', '5 5')

        priceOnYScale.append('rect').attr('class', 'livePriceRect').attr('x', 0).attr('y', pixelPrice - centerRectOnPriceLinePixel + centerTextOnPriceLinePixel)
            .attr('width', '49px').attr('height', '20px').attr('fill', 'blue')

        priceOnYScale.append('text').attr('class', 'livePriceText').attr('color', 'white')
            .text(`$${mostRecentCandle.ClosePrice.toFixed(2)}`).attr("x", 3).attr("y", pixelPrice + centerTextOnPriceLinePixel);

    }, [candleData, mostRecentCandle, candleDimensions, chartZoomState?.x, chartZoomState?.y])







    //plot original prices/dates
    useEffect(() =>
    {

        const mostRecentPriceSelect = stockCandleSVG.select('.keyLevels')
        mostRecentPriceSelect.selectAll('line').remove()

        if (preDimensionsAndCandleCheck() || !originalPrice || !articlePublishDate) return

        if (originalPrice)
        {
            const mostRecentPricePixel = createPriceScale({ priceToPixel: originalPrice })

            mostRecentPriceSelect.append('line').attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', mostRecentPricePixel).attr('y2', mostRecentPricePixel)
                .attr('stroke', 'blue').attr('stroke-dasharray', '2 2')
        }
        if (articlePublishDate)
        {
            const publishDatePixel = createDateScale({ dateToPixel: articlePublishDate })
            mostRecentPriceSelect.append('line').attr('x1', publishDatePixel).attr('x2', publishDatePixel)
                .attr('y1', 0).attr('y2', candleDimensions.height)
                .attr('stroke', 'blue').attr('stroke-dasharray', '2 2')
        }



    }, [ticker, originalPrice, articlePublishDate, candleDimensions, chartZoomState?.x, chartZoomState?.y])


    //zoomYBehavior
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        const zoomBehavior = zoom().on('zoom', () =>
        {
            const zoomState = zoomTransform(priceScaleSVG.node())
            setChartZoomState(prev => { return { ...prev, y: { x: zoomState.x, y: zoomState.y, k: zoomState.k } } })
        })
        priceScaleSVG.call(zoomBehavior)
    }, [candleData, priceDimensions])

    //zoomXBehavior
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        const zoomBehavior = zoom().on('zoom', () =>
        {

            const zoomState = zoomTransform(stockCandleSVG.node())
            setChartZoomState(prev => { return { ...prev, x: { x: zoomState.x, y: zoomState.y, k: zoomState.k } } })
        })
        stockCandleSVG.call(zoomBehavior)
    }, [candleData, candleDimensions])



    return (
        <div className='SVGGraphWrapper' onContextMenu={(e) => { e.preventDefault(); setChartZoomState({ x: undefined, y: undefined }) }}>

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
                    <g className='discountPriceLevels' />
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

export default RunnerChart