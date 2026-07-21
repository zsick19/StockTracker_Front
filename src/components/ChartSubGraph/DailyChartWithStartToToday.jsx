import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useResizeObserver } from '../../hooks/useResizeObserver'
import { scaleDiscontinuous, discontinuityRange, discontinuitySkipUtcWeekends } from '@d3fc/d3fc-discontinuous-scale'
import { addDays, isToday, subMonths, addYears, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, eachDayOfInterval, getDay, addHours, addMinutes, differenceInBusinessDays, set, isWeekend, previousFriday, subBusinessDays, addBusinessDays, eachWeekOfInterval } from 'date-fns'
import { select, drag, zoom, zoomTransform, axisBottom, axisLeft, scaleTime, min, max, line, timeDay, scaleLinear, timeMonths, zoomIdentity, curveLinear, curveBasis, timeFormat } from 'd3'
import { getBreaksBetweenDates } from '../../Utilities/TimeFrames'
import { pixelBuffer } from './GraphChartConstants'
import { useDispatch, useSelector } from 'react-redux'
import { selectMostRecentPriceByTicker } from '../../features/Engine/EnginePlanApiSlice'

function DailyChartWithStartToToday({ ticker, candleData, timeFrame, chartStartDate, pricePoints, uuid, isZoomAble, currentDiscount, discountPrices, exitAlertPrice })
{
    const dispatch = useDispatch()
    const preDimensionsAndCandleCheck = () => { return !priceDimensions || !candleDimensions }
    const priceSVG = useRef()
    const candleSVG = useRef()
    const priceSVGWrapper = useRef(null)
    const candleSVGWrapper = useRef(null)
    let priceDimensions = useResizeObserver(priceSVGWrapper)
    let candleDimensions = useResizeObserver(candleSVGWrapper)
    const stockCandleSVG = select(candleSVG.current)
    const priceScaleSVG = select(priceSVG.current)

    const mostRecentPrice = useSelector(state => selectMostRecentPriceByTicker(state, ticker))
    console.log(mostRecentPrice)


    //chart zoom states    
    const [chartZoomState, setChartZoomState] = useState({ x: undefined, y: undefined })
    const [enableZoom, setEnableZoom] = useState(true)

    //chart scale creation
    const minPrice = useMemo(() => min(candleData, d => d.LowPrice), [candleData])
    const maxPrice = useMemo(() => max(candleData, d => d.HighPrice), [candleData])
    const minVol = useMemo(() => min(candleData, d => d.Volume), [candleData])
    const maxVol = useMemo(() => max(candleData, d => d.Volume), [candleData])


    const dateBetweenStartAndFinishInterval = useMemo(() => eachWeekOfInterval({ start: subBusinessDays(chartStartDate, 5), end: addBusinessDays(new Date(), 5) }), [chartStartDate])
    const visualBreaksPeriods = useMemo(() => getBreaksBetweenDates(new Date(chartStartDate), new Date(), 'days'), [chartStartDate])
    // const excludedPeriods = useMemo(() => generateMarketTradingHoursBetweenTwoDates(chartStartDate, new Date()), [chartStartDate])
    // const intraDayTickMarks = useMemo(() => generateIntraDayTickMarksBetweenTwoDates(chartStartDate, new Date()), [chartStartDate])


    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        let xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuitySkipUtcWeekends())
            .domain([subBusinessDays(chartStartDate, 5), addBusinessDays(new Date(), 5)]).range([0, candleDimensions.width])

        if (chartZoomState?.x)
        {
            const zoomValues = zoomIdentity.translate(chartZoomState.x.x, chartZoomState.x.y).scale(chartZoomState.x.k)
            const newZoomState = zoomValues.rescaleX(xDateScale)
            xDateScale.domain(newZoomState.domain())
        }

        if (pixelToDate !== undefined) return new Date(Math.floor(xDateScale.invert(pixelToDate))).toISOString()
        else if (dateToPixel !== undefined) return xDateScale(new Date(dateToPixel))
        else return xDateScale

    }, [candleData, chartZoomState?.x, candleDimensions, chartStartDate])


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


    }, [candleData, chartZoomState?.y, priceDimensions])


    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        let dateVisualSelect = stockCandleSVG.select('.visualDateBreaks')

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
    }, [candleDimensions, chartZoomState?.x, chartZoomState?.y])

    //plot stock candles and scale axis
    useEffect(() => { stockCandleSVG.select('.x-axis').selectAll('*').remove() }, [timeFrame])
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        const xAxis = axisBottom(createDateScale())
            // .tickValues(intraDayTickMarks)
            .tickFormat(timeFormat("%-m/%-d"));
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







    }, [candleData, minPrice, maxPrice, candleDimensions, chartZoomState?.x, chartZoomState?.y])



    //plot any plan/pattern extracted values
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        const patternSelect = stockCandleSVG.select('.patternPriceLevels')

        patternSelect.selectAll('line').remove()
        patternSelect.selectAll('rect').remove()
        patternSelect.selectAll('text').remove()


        const entryPricePixel = createPriceScale({ priceToPixel: pricePoints.entryPrice })
        patternSelect.append('line').attr('class', 'dailyEMALines')
            .attr('x1', 0).attr('x2', candleDimensions.width)
            .attr('y1', entryPricePixel).attr('y2', entryPricePixel)
            .attr('stroke', 'blue').attr('stroke-dasharray', '5 5')

        patternSelect.append('text').attr('class', 'keyLevelSubText')
            .text(`Entry - ${pricePoints.entryPrice}`)
            .attr('x', candleDimensions.width - 80)
            .attr('y', entryPricePixel).attr('dy', -7)

        const stopLossPricePixel = createPriceScale({ priceToPixel: pricePoints.stopLossPrice })
        patternSelect.append('line').attr('class', 'dailyEMALines')
            .attr('x1', 0).attr('x2', candleDimensions.width)
            .attr('y1', stopLossPricePixel).attr('y2', stopLossPricePixel)
            .attr('stroke', 'red').attr('stroke-dasharray', '5 5')
        patternSelect.append('text').attr('class', 'keyLevelSubText')
            .text(`Stop - ${pricePoints.stopLossPrice}`)
            .attr('x', candleDimensions.width - 80)
            .attr('y', stopLossPricePixel).attr('dy', -7)


        const exitPricePixel = createPriceScale({ priceToPixel: pricePoints.exitPrice })
        patternSelect.append('line').attr('class', 'dailyEMALines')
            .attr('x1', 0).attr('x2', candleDimensions.width)
            .attr('y1', exitPricePixel).attr('y2', exitPricePixel)
            .attr('stroke', 'green').attr('stroke-dasharray', '5 5')

        patternSelect.append('text').attr('class', 'keyLevelSubText')
            .text(`Exit - ${pricePoints.exitPrice}`)
            .attr('x', candleDimensions.width - 80)
            .attr('y', exitPricePixel).attr('dy', -7)

        const floorPricePixel = createPriceScale({ priceToPixel: pricePoints.floorPrice })
        patternSelect.append('line').attr('class', 'dailyEMALines')
            .attr('x1', 0).attr('x2', candleDimensions.width)
            .attr('y1', floorPricePixel).attr('y2', floorPricePixel)
            .attr('stroke', 'orange').attr('stroke-dasharray', '5 5')

        patternSelect.append('text').attr('class', 'keyLevelSubText')
            .text(`Floor - ${pricePoints.floorPrice}`)
            .attr('x', candleDimensions.width - 80)
            .attr('y', floorPricePixel).attr('dy', -7)


        patternSelect.append('rect').attr('class', 'metricVisual')
            .attr('width', candleDimensions.width).attr('height', entryPricePixel)
            .attr('x', 0).attr('y', 0).attr('fill', 'green').attr('opacity', 0.05)
        patternSelect.append('rect').attr('class', 'metricVisual')
            .attr('width', candleDimensions.width).attr('height', candleDimensions.height - entryPricePixel)
            .attr('x', 0).attr('y', floorPricePixel).attr('fill', 'red').attr('opacity', 0.05)


    }, [ticker, pricePoints, candleDimensions, chartZoomState?.x, chartZoomState?.y,])


    //plot any plan/pattern extracted values
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !discountPrices) return

        const discountSelect = stockCandleSVG.select('.discountPriceLevels')

        discountSelect.selectAll('line').remove()
        discountSelect.selectAll('rect').remove()
        discountSelect.selectAll('text').remove()

        if (currentDiscount === 'Above Stop' && discountPrices.aboveStopLoss)
        {
            const entryPricePixel = createPriceScale({ priceToPixel: discountPrices.aboveStopLoss })
            discountSelect.append('line').attr('class', 'dailyEMALines')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', entryPricePixel).attr('y2', entryPricePixel)
                .attr('stroke', 'blue').attr('stroke-dasharray', '5 5')

            discountSelect.append('text').attr('class', 'keyLevelSubText')
                .text(`Above Stop $${discountPrices.aboveStopLoss.toFixed(3)}`)
                .attr('x', 20).attr('y', entryPricePixel).attr('dy', -7)
        }
        if (currentDiscount === 'Below Stop' && discountPrices.belowStopLoss)
        {
            const entryPricePixel = createPriceScale({ priceToPixel: discountPrices.belowStopLoss })
            discountSelect.append('line').attr('class', 'dailyEMALines')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', entryPricePixel).attr('y2', entryPricePixel)
                .attr('stroke', 'orange').attr('stroke-dasharray', '5 5')

            discountSelect.append('text').attr('class', 'keyLevelSubText')
                .text(`Below Stop $${discountPrices.belowStopLoss.toFixed(3)}`)
                .attr('x', 20).attr('y', entryPricePixel).attr('dy', -7)
        }
        if (currentDiscount === 'Above Max Pain' && discountPrices.aboveMaxPain)
        {
            const entryPricePixel = createPriceScale({ priceToPixel: discountPrices.aboveMaxPain })
            discountSelect.append('line').attr('class', 'dailyEMALines')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', entryPricePixel).attr('y2', entryPricePixel)
                .attr('stroke', 'red').attr('stroke-dasharray', '5 5')

            discountSelect.append('text').attr('class', 'keyLevelSubText')
                .text(`Above Max Pain $${discountPrices.aboveMaxPain.toFixed(3)}`)
                .attr('x', 20).attr('y', entryPricePixel).attr('dy', -7)

        }
        if (exitAlertPrice)
        {
            const entryPricePixel = createPriceScale({ priceToPixel: exitAlertPrice })
            discountSelect.append('line').attr('class', 'dailyEMALines')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', entryPricePixel).attr('y2', entryPricePixel)
                .attr('stroke', 'green').attr('stroke-dasharray', '2 5')

            discountSelect.append('text').attr('class', 'keyLevelSubText')
                .text(`Exit Alert $${exitAlertPrice.toFixed(3)}`)
                .attr('x', 20).attr('y', entryPricePixel).attr('dy', -7)

        }


    }, [ticker, currentDiscount, discountPrices, exitAlertPrice, candleDimensions, chartZoomState?.x, chartZoomState?.y])

    //plotMostRecentPrice
    useEffect(() =>
    {

        const mostRecentPriceSelect = stockCandleSVG.select('.lastCandleUpdate')
        const priceScale = priceScaleSVG.select('.currentPrice')
        mostRecentPriceSelect.selectAll('line').remove()
        priceScale.selectAll('text').remove()
        priceScale.selectAll('rect').remove()
        if (preDimensionsAndCandleCheck() || !mostRecentPrice) return

        let centerTextOnPriceLinePixel = 4
        let centerRectOnPriceLinePixel = 15
        if (mostRecentPrice)
        {
            const mostRecentPricePixel = createPriceScale({ priceToPixel: mostRecentPrice })

            mostRecentPriceSelect.append('line').attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', mostRecentPricePixel).attr('y2', mostRecentPricePixel)
                .attr('stroke', 'green').attr('stroke-dasharray', '2 2')


            priceScale.append('rect').attr('class', 'livePriceRect')
                .attr('y', mostRecentPricePixel - centerRectOnPriceLinePixel + centerTextOnPriceLinePixel)
                .attr('x', 0).attr('width', '49px').attr('height', '20px').attr('fill', 'blue').attr('rx', 7)

            priceScale.append('text').attr('class', 'livePriceText').attr('color', 'white')
                .attr("x", 3).attr("y", mostRecentPricePixel + centerTextOnPriceLinePixel).attr("dy", "-1px")
                .text(`$${mostRecentPrice.toFixed(2)}`)
        }



    }, [ticker, mostRecentPrice, candleDimensions, chartZoomState?.x, chartZoomState?.y])



    //zoomXBehavior
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !isZoomAble) return
        const zoomBehavior = zoom().on('zoom', () =>
        {
            if (enableZoom)
            {
                const zoomState = zoomTransform(stockCandleSVG.node())
                setChartZoomState(prev => { return { ...prev, x: { x: zoomState.x, y: zoomState.y, k: zoomState.k } } })
                // dispatch(setXZoomState({ uuid, zoom: { x: zoomState.x, y: zoomState.y, k: zoomState.k } }))
            }
            return null
        })
        stockCandleSVG.call(zoomBehavior)
    }, [candleData, enableZoom, candleDimensions])

    //zoomYBehavior
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !isZoomAble) return
        const zoomBehavior = zoom().on('zoom', () =>
        {
            const zoomState = zoomTransform(priceScaleSVG.node())
            setChartZoomState(prev => { return { ...prev, y: { x: zoomState.x, y: zoomState.y, k: zoomState.k } } })
        })
        priceScaleSVG.call(zoomBehavior)
    }, [candleData, priceDimensions])

    //configure svg cross hair, context menu, and tool interactions
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        initializeMouseCrossHairBehavior()
    }, [candleDimensions, candleData, chartZoomState?.x, chartZoomState?.y,])


    function initializeMouseCrossHairBehavior()
    {
        stockCandleSVG.on('mousemove', (e) => drawCrossHairs(e))
        stockCandleSVG.on('mouseout', (e) => clearCrossHairs(e))
    }
    function drawCrossHairs(e)
    {
        if (preDimensionsAndCandleCheck()) return
        const svgCoordinates = new DOMPoint(e.clientX, e.clientY).matrixTransform(candleSVG.current.getScreenCTM().inverse());
        const crossHairCoordinates = { svgX: svgCoordinates.x, svgY: svgCoordinates.y, mouseHoverOffset: 3 }

        const SVG = stockCandleSVG.select('.crossHairs')
        SVG.select('.crossY').attr('x1', 0).attr('y1', crossHairCoordinates.svgY - crossHairCoordinates.mouseHoverOffset).attr('x2', candleDimensions.width - 75).attr('y2', crossHairCoordinates.svgY - crossHairCoordinates.mouseHoverOffset).attr('visibility', 'visible')
        SVG.select('.crossX').attr('x1', crossHairCoordinates.svgX - crossHairCoordinates.mouseHoverOffset).attr('y1', 0).attr('x2', crossHairCoordinates.svgX - crossHairCoordinates.mouseHoverOffset).attr('y2', candleDimensions.height).attr('visibility', 'visible')
        SVG.select('.priceY').text(`$${createPriceScale({ pixelToPrice: e.offsetY })}`).attr("x", candleDimensions.width - 75).attr("y", e.offsetY).attr('visibility', 'visible');
    }
    function clearCrossHairs(e)
    {
        stockCandleSVG.select('.crossHairs').selectAll('line').attr('visibility', 'hidden')
        stockCandleSVG.select('.crossHairs').selectAll('text').attr('visibility', 'hidden')
    }




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

export default DailyChartWithStartToToday