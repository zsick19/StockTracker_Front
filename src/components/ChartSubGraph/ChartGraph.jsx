import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectAllCharting } from '../../features/Charting/chartingElements'
import { useResizeObserver } from '../../hooks/useResizeObserver'
import { scaleDiscontinuous, discontinuitySkipWeekends } from '@d3fc/d3fc-discontinuous-scale'
import { sub, subBusinessDays, addDays, isToday } from 'date-fns'
import { select, drag, zoom, zoomTransform, axisBottom, axisLeft, path, scaleTime, min, max, line, timeDay, curveBasis, timeWeek, scaleLog, scaleLinear, scaleBand, extent, timeMonth, group } from 'd3'
import { pixelBuffer } from './GraphChartConstants'
import { selectTickerKeyLevels } from '../../features/KeyLevels/KeyLevelGraphElements'

function ChartGraph({ ticker, candleData, mostRecentPrice, chartingData, timeFrame })
{
    //    const allChartingData = useSelector(selectAllCharting)
    const KeyLevels = useSelector((state) => selectTickerKeyLevels(state, ticker.ticker))


    const preDimensionsAndCandleCheck = () => { return !priceDimensions || !candleDimensions }
    const priceSVG = useRef()
    const candleSVG = useRef()
    const priceSVGWrapper = useRef(null)
    const candleSVGWrapper = useRef(null)

    let priceDimensions = useResizeObserver(priceSVGWrapper)
    let candleDimensions = useResizeObserver(candleSVGWrapper)
    const [currentYZoomState, setCurrentYZoomState] = useState()
    const [currentXZoomState, setCurrentXZoomState] = useState()
    const [enableZoom, setEnableZoom] = useState(true)



    const minPrice = useMemo(() => min(candleData, d => d.LowPrice), [candleData])
    const maxPrice = useMemo(() => max(candleData, d => d.HighPrice), [candleData])


    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        let startDate
        let futureForwardEndDate

        if (timeFrame.unitOfDuration === 'Y')
        {
            startDate = sub(new Date(), { days: 365 })
            futureForwardEndDate = addDays(new Date(), pixelBuffer.xDirectionFutureDaysToGraph)
        }
        else if (timeFrame.unitOfDuration === 'D')
        {
            startDate = new Date()
            futureForwardEndDate = addDays(startDate, 1)
        }

        const xScaleNotForUse = scaleTime().domain([startDate, futureForwardEndDate]).range([0, candleDimensions.width])
        const xDateScale = scaleDiscontinuous(xScaleNotForUse).discontinuityProvider(discontinuitySkipWeekends())

        if (currentXZoomState)
        {
            const newZoomState = currentXZoomState.rescaleX(xDateScale)
            xDateScale.domain(newZoomState.domain())
        }
        if (pixelToDate !== undefined) return xDateScale.invert(pixelToDate).toISOString()
        else if (dateToPixel !== undefined) return xDateScale(new Date(dateToPixel))
        else return xDateScale

    }, [candleData, currentXZoomState, candleDimensions, timeFrame])

    const createPriceScale = useCallback(({ priceToPixel = undefined, pixelToPrice = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const yScale = scaleLinear()
            .domain([minPrice - pixelBuffer.yPriceBuffer, maxPrice + pixelBuffer.yPriceBuffer])
            .range([candleDimensions.height - pixelBuffer.yDirectionPixelBuffer, 0])
            .interpolate(function (a, b)
            {
                const c = b - a;
                return function (t) { return +(a + t * c).toFixed(2); };
            })

        if (currentYZoomState)
        {
            const newZoomScale = currentYZoomState.rescaleY(yScale)
            yScale.domain(newZoomScale.domain())
        }

        if (pixelToPrice !== undefined) return Math.round(yScale.invert(pixelToPrice) * 100) / 100
        else if (priceToPixel !== undefined) return yScale(priceToPixel)
        else return yScale

    }, [candleData, currentYZoomState, priceDimensions])



    const stockCandleSVG = select(candleSVG.current)
    const priceScaleSVG = select(priceSVG.current)

    //plot stock candles
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        const xAxis = axisBottom(createDateScale())
        const yAxis = axisLeft(createPriceScale())

        priceScaleSVG.select('.y-axis').style('transform', `translateX(${priceDimensions.width - 1}px)`).call(yAxis)
        stockCandleSVG.select('.x-axis').style('transform', `translateY(${candleDimensions.height - pixelBuffer.yDirectionPixelBuffer}px)`).call(xAxis)


        const dataLength = candleData.length - 1
        const baseDatePixel = createDateScale({ dateToPixel: candleData[0].Timestamp })
        const endDatePixel = createDateScale({ dateToPixel: candleData[dataLength].Timestamp })
        const pixelCountToEvenlySpaceCandles = (endDatePixel - baseDatePixel) / dataLength

        stockCandleSVG.select('.tickerVal').selectAll('.candle').data(candleData, d => d.Timestamp).join(enter => createCandles(enter), update => updateCandles(update))
        function createCandles(enter)
        {
            enter.each(function (d, i)
            {
                var tickerGroups = select(this).append('g').attr('class', 'candle')
                tickerGroups.append('line').attr('class', 'lowHigh').attr('stroke', 'black').attr('stroke-width', 1).attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                tickerGroups.append('line').attr('class', 'openClose').attr('stroke', (d, i) => { return d.OpenPrice < d.ClosePrice ? 'green' : 'red' }).attr('stroke-width', 2).attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
                tickerGroups.attr("transform", (d) => { return `translate(${baseDatePixel + (pixelCountToEvenlySpaceCandles * i)},0)` })
            })
        }
        function updateCandles(update)
        {
            update.each(function (d, i)
            {
                const candle = select(this)
                candle.attr("transform", () => { return `translate(${baseDatePixel + (pixelCountToEvenlySpaceCandles * i)},0)` })
                candle.select('.lowHigh').attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                candle.select('.openClose').attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
            })
        }

        // const monthBreaks = getMonthsBetweenDates(new Date(2024, 1, 1), new Date())
        // let pixelDates = monthBreaks.map((d) => createDateScale({ dateToPixel: d }))

        // stockCandleSVG.select('.monthBreak').selectAll('.month').data(monthBreaks).join(enter => createMonths(enter), update => updateMonths(update))
        // function createMonths(enter)
        // {
        //     enter.append('rect').attr('class', (d, i) => { return i % 2 !== 0 ? 'monthOdd month' : 'monthEven month' })
        //         .attr('x', (d, i) => createDateScale({ dateToPixel: d })).attr('y', -pixelBuffer.yDirectionPixelBuffer).attr('width', (d, i) => { return pixelDates[i + 1] - createDateScale({ dateToPixel: d }) }).attr('height', candleDimensions.height)
        // }
        // function updateMonths(update)
        // {
        //     update.each(function (d, i)
        //     {
        //         let start = createDateScale({ dateToPixel: d })
        //         select(this).attr('x', start).attr('y', -pixelBuffer.yDirectionPixelBuffer).attr('width', (pixelDates[i + 1] - start)).attr('height', candleDimensions.height)
        //     })
        // }


        // if (initialTrackPrice && trackStartDate)
        // {
        //     stockCandleSVG.select('.initialTrack').selectAll('line').remove()
        //     stockCandleSVG.select('.initialTrack').append('line').attr('x1', 0).attr('x2', 5000)
        //         .attr('y1', createPriceScale({ priceToPixel: initialTrackPrice })).attr('y2', createPriceScale({ priceToPixel: initialTrackPrice }))
        //         .attr('stroke', 'purple').attr('stroke-dasharray', '5,2')

        //     stockCandleSVG.select('.initialTrack').append('line').attr('x1', createDateScale({ dateToPixel: trackStartDate })).attr('x2', createDateScale({ dateToPixel: trackStartDate }))
        //         .attr('y1', 0).attr('y2', candleDimensions.height)
        //         .attr('stroke', 'purple').attr('stroke-dasharray', '5,2')
        // }


        stockCandleSVG.select('.currentPrice').selectAll('line').remove()
        stockCandleSVG.select('.keyLevels').selectAll('line').remove()

        if (KeyLevels.gammaFlip)
        {
            let gammaPrice = createPriceScale({ priceToPixel: KeyLevels.gammaFlip })
            stockCandleSVG.select('.keyLevels').append('line')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', gammaPrice).attr('y2', gammaPrice)
                .attr('stroke', 'yellow')
                .attr('stroke-width', '1px')
                .attr('stroke-dasharray', '5 5')
        }

        if (mostRecentPrice.Price)
        {
            let pixelPrice = createPriceScale({ priceToPixel: mostRecentPrice.Price })
            stockCandleSVG.select('.currentPrice').append('line')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', pixelPrice).attr('y2', pixelPrice)
                .attr('stroke', 'blue')
                .attr('stroke-width', '2px')
                .attr('stroke-dasharray', '5 5')




        }



    }, [candleData, KeyLevels, candleDimensions, currentXZoomState, currentYZoomState, timeFrame])


    //zoomXBehavior
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        const zoomBehavior = zoom().scaleExtent([0.1, 5]).on('zoom', () =>
        {
            if (enableZoom)
            {
                const zoomState = zoomTransform(stockCandleSVG.node())
                setCurrentXZoomState(zoomState)
            }
            return null
        })
        stockCandleSVG.call(zoomBehavior)
    }, [candleData, enableZoom, candleDimensions])

    //zoomYBehavior
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        const zoomBehavior = zoom().scaleExtent([0.1, 5]).on('zoom', () =>
        {
            const zoomState = zoomTransform(priceScaleSVG.node())
            setCurrentYZoomState(zoomState)
        })
        priceScaleSVG.call(zoomBehavior)
    }, [candleData, priceDimensions])


    return (
        <div className='SVGGraphWrapper'>
            <div ref={priceSVGWrapper} className='priceSVGWrapper'>
                <svg ref={priceSVG}>
                    <g className='y-axis' />
                </svg>
            </div>

            <div ref={candleSVGWrapper} className='dateSVGWrapper'>
                <svg ref={candleSVG}>
                    <g className='x-axis' />
                    <g className='monthBreak' />
                    <g className='initialTrack' />
                    <g className='enterExits' />
                    <g className='tickerVal' />
                    <g className='crossHairs' >
                        <line className='crossY' strokeWidth='0.5px' stroke='black'></line>
                        <line className='crossX' strokeWidth='0.5px' stroke='black'></line>
                        <text className='priceY'></text>
                    </g>
                    <g className='temp' />
                    <g className='emaLines' />
                    <g className='volumeProfile' />
                    <g className='freeLines' />
                    <g className='linesH' />
                    <g className='trendLines' />
                    <g className='wedges' />
                    <g className='channels' />
                    <g className='triangles' />
                    <g className='currentPrice' />
                    <g className='keyLevels' />
                </svg>
            </div>
        </div>
    )
}

export default ChartGraph