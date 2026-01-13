import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addEnterExitToCharting, addLine, makeSelectChartingByTicker, removeChartingElement, updateEnterExitToCharting, updateLine } from '../../features/Charting/chartingElements'
import { useResizeObserver } from '../../hooks/useResizeObserver'
import { scaleDiscontinuous, discontinuitySkipWeekends, discontinuityRange } from '@d3fc/d3fc-discontinuous-scale'
import { sub, subBusinessDays, addDays, isToday } from 'date-fns'
import { select, drag, zoom, zoomTransform, axisBottom, axisLeft, path, scaleTime, min, max, line, timeDay, curveBasis, timeWeek, scaleLog, scaleLinear, scaleBand, extent, timeMonth, group } from 'd3'
import { pixelBuffer } from './GraphChartConstants'
import { selectTickerKeyLevels } from '../../features/KeyLevels/KeyLevelGraphElements'
import { defineEnterExitPlan, makeSelectEnterExitByTicker, selectEnterExitByTickerMemo } from '../../features/EnterExitPlans/EnterExitGraphElement'
import { selectCurrentTool } from '../../features/Charting/ChartingTool'
import { selectChartVisibility } from '../../features/Charting/ChartingVisibility'
import { toolFunctionExports } from '../../Utilities/graphChartingFunctions'
import ChartContextMenuContainer from './contextMenus/ChartContextMenuContainer'
import { ChartingToolEdits, ChartingTools } from '../../Utilities/ChartingTools'
import { defaultChartingStyles } from '../../Utilities/GraphStyles'
import { lineHover, lineNoHover } from '../../Utilities/chartingHoverFunctions'
import { useUpdateEnterExitPlanMutation } from '../../features/EnterExitPlans/EnterExitApiSlice'
import { selectChartEditMode } from '../../features/Charting/EditChartSelection'

function ChartGraph({ ticker, candleData, chartId, mostRecentPrice, timeFrame })
{
    //redux charting data selectors
    const dispatch = useDispatch()
    const KeyLevels = useSelector((state) => selectTickerKeyLevels(state, ticker.ticker))
    const selectedEnterExitMemo = useMemo(makeSelectEnterExitByTicker, [])
    const EnterExitPlan = useSelector(state => selectedEnterExitMemo(state, ticker))
    const selectedChartingMemo = useMemo(makeSelectChartingByTicker, [])
    const charting = useSelector(state => selectedChartingMemo(state, ticker))

    const editMode = useSelector(selectChartEditMode)

    const [updateEnterExitPlan] = useUpdateEnterExitPlanMutation()


    //redux graph functioning selectors
    const currentTool = useSelector(selectCurrentTool)
    const chartingVisibility = useSelector(selectChartVisibility)

    //context menu show and positioning
    const [showContextMenu, setShowContextMenu] = useState({ display: false, style: {} })

    //charting interaction create, update, delete related
    const initialPixelSet = { X1: undefined, Y1: undefined, firstClick: true }
    const pixelSet = useRef(initialPixelSet)
    const [captureComplete, setCaptureComplete] = useState(false)
    const [editChartElement, setEditChartElement] = useState()

    //chart plotting necessities
    const preDimensionsAndCandleCheck = () => { return !priceDimensions || !candleDimensions }
    const priceSVG = useRef()
    const candleSVG = useRef()
    const priceSVGWrapper = useRef(null)
    const candleSVGWrapper = useRef(null)
    let priceDimensions = useResizeObserver(priceSVGWrapper)
    let candleDimensions = useResizeObserver(candleSVGWrapper)

    //chart zoom states
    const [currentYZoomState, setCurrentYZoomState] = useState()
    const [currentXZoomState, setCurrentXZoomState] = useState()
    const [enableZoom, setEnableZoom] = useState(true)

    //chart scale creation
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

        //const xScaleNotForUse = scaleTime().domain([startDate, futureForwardEndDate]).range([0, candleDimensions.width])
        //const xDateScale = scaleDiscontinuous(xScaleNotForUse).discontinuityProvider(discontinuitySkipWeekends())
        const blockStart = new Date();
        blockStart.setHours(17, 0, 0, 0);

        const blockEnd = new Date();
        blockEnd.setDate(blockEnd.getDate() + 1);
        blockEnd.setHours(6, 0, 0, 0);
        const xDateScale = scaleDiscontinuous(scaleTime())
            .discontinuityProvider(discontinuityRange([blockStart, blockEnd]))
            .domain([startDate, futureForwardEndDate])
            .range([0, candleDimensions.width])

        //        const xScaleNotForUse = scaleTime().domain([startDate, futureForwardEndDate]).range([0, candleDimensions.width])
        //      const xDateScale = scaleDiscontinuous(xScaleNotForUse).discontinuityProvider(discontinuitySkipWeekends())




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
        else if (priceToPixel !== undefined)
        {
            return yScale(priceToPixel)
        }
        else return yScale

    }, [candleData, currentYZoomState, priceDimensions])

    //scaleRefs for user charting drag functionality
    const yScaleRef = useRef()
    yScaleRef.current = createPriceScale
    const xScaleRef = useRef()
    xScaleRef.current = createDateScale
    const tickerRef = useRef()
    tickerRef.current = ticker


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
                //tickerGroups.attr("transform", (d) => { return `translate(${createDateScale({ dateToPixel: d.Timestamp })},0)` })
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
        //   stockCandleSVG.select('.enterExits').selectAll('line').remove()

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
                .attr('stroke-width', '1px')
                .attr('stroke-dasharray', '5 5')
        }


    }, [candleData, KeyLevels, EnterExitPlan, candleDimensions, currentXZoomState, currentYZoomState, timeFrame])

    //plot user charting  
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !charting) return

        //free line creation and update
        stockCandleSVG.select('.freeLines').selectAll('.line_group').data(charting.freeLines).join((enter) => createLineAndCircle(enter), (update) => updateLines(update))
        function createLineAndCircle(enter)
        {
            let linePixel;
            enter.each(function (d)
            {
                linePixel = provideLinePixels(d)
                const lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today' : 'line_group previous')

                lineGroup.append('line').attr('class', 'drawnLine').attr('x1', linePixel.point1X).attr('y1', linePixel.point1Y).attr('x2', linePixel.point2X).attr('y2', linePixel.point2Y)
                    .attr('stroke', defaultChartingStyles.freeLine).attr('stroke-linecap', 'round').attr('stroke-width', defaultChartingStyles.freeLineStrokeWidth)
                    .on('mouseover', function (e, d) { lineHover(select(this)); setEditChartElement({ chartingElement: d, group: 'freeLines' }); }).on('mouseleave', lineNoHover)

                    .call(dragBehavior)


                lineGroup.append('circle').attr('class', 'edgeCircle1').attr("cx", (d) => linePixel.point1X).attr("cy", linePixel.point1Y)
                    .attr("r", defaultChartingStyles.freeLineCirclesSize).attr('fill', defaultChartingStyles.freeLineCirclesColor)
                lineGroup.append('circle').attr('class', 'edgeCircle2').attr("cx", linePixel.point2X).attr("cy", linePixel.point2Y)
                    .attr("r", defaultChartingStyles.freeLineCirclesSize).attr('fill', defaultChartingStyles.freeLineCirclesColor)
            })
        }
        function updateLines(update)
        {
            let linePixel;
            update.select('.drawnLine').each(function (d)
            {
                linePixel = provideLinePixels(d)
                select(this).attr('x1', linePixel.point1X).attr('y1', linePixel.point1Y).attr('x2', linePixel.point2X).attr('y2', linePixel.point2Y)

                const parent = select(this.parentNode)
                parent.select('.edgeCircle1').attr("cx", linePixel.point1X).attr("cy", linePixel.point1Y)
                parent.select('.edgeCircle2').attr("cx", linePixel.point2X).attr("cy", linePixel.point2Y)
            })
        }
        function provideLinePixels(d)
        {
            return {
                point1X: createDateScale({ dateToPixel: d.dateP1 }),
                point1Y: createPriceScale({ priceToPixel: d.priceP1 }),
                point2X: createDateScale({ dateToPixel: d.dateP2 }),
                point2Y: createPriceScale({ priceToPixel: d.priceP2 })
            }
        }


        //enter exit plan creation and update
        if (EnterExitPlan) { stockCandleSVG.select('.enterExits').selectAll('.line_group').data([EnterExitPlan]).join((enter) => createEnterExit(enter), (update) => updateEnterExit(update)) }
        else if (charting?.enterExitLines) { stockCandleSVG.select('.enterExits').selectAll('.line_group').data([charting.enterExitLines]).join((enter) => createEnterExit(enter), (update) => updateEnterExit(update)) }
        function createEnterExit(enter)
        {
            enter.each(function (d)
            {
                let startXPosition = candleDimensions.width * 0.9
                let widthPosition = startXPosition + 100
                var lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today' : 'line_group previous')

                const names = ['stopLossLine', 'enterLine', 'enterBufferLine', 'exitBufferLine', 'exitLine', 'moonLine']
                const lineColors = ['green', 'yellow', 'red', 'yellow', 'green', 'black']

                const yPositions = [d.stopLossPrice, d.enterPrice, d.enterBufferPrice, d.exitBufferPrice, d.exitPrice, d.moonPrice].map((price) => yScaleRef.current({ priceToPixel: price }))
                lineGroup.append('rect').attr('class', 'stopLossShading').attr('x', 0).attr('y', yPositions[1]).attr('width', candleDimensions.width).attr('height', yPositions[0] - yPositions[1]).attr('fill', 'red').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'enterBufferShading').attr('x', 0).attr('y', yPositions[2]).attr('width', candleDimensions.width).attr('height', yPositions[1] - yPositions[2]).attr('fill', 'yellow').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'exitBufferShading').attr('x', 0).attr('y', yPositions[4]).attr('width', candleDimensions.width).attr('height', yPositions[3] - yPositions[4]).attr('fill', 'green').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'moonShading').attr('x', 0).attr('y', yPositions[5]).attr('width', candleDimensions.width).attr('height', yPositions[4] - yPositions[5]).attr('fill', 'blue').attr('opacity', 0.1)


                yPositions.map((position, index) =>
                {
                    lineGroup.append('line').attr('class', `${names[index]} edit`).attr('x1', 0).attr('x2', 5000).attr('y1', position).attr('y2', position).attr('stroke', lineColors[index]).attr('stroke-width', 10)
                        .attr('visibility', 'hidden')
                        .on('mouseover', function (e, d) { setEditChartElement({ chartingElement: d, group: 'enterExitLines' }); select(this).transition().delay(250).attr('stroke-width', 10) })
                        .on('mouseleave', select(this).transition().delay(250).attr('stroke-width', 5))

                    //      lineGroup.append('text').attr('class', `${names[index]}Text`).attr('x', startXPosition).attr('y', position).text((d) => `$${100}`)
                })
            })
        }
        function updateEnterExit(update)
        {
            let startXPosition = candleDimensions.width * 0.9
            let widthPosition = startXPosition + 100

            const names = ['stopLossLine', 'enterLine', 'enterBufferLine', 'exitBufferLine', 'exitLine', 'moonLine']
            update.each(function (d)
            {
                const yPositions = [d.stopLossPrice, d.enterPrice, d.enterBufferPrice, d.exitBufferPrice, d.exitPrice, d.moonPrice].map((price) => createPriceScale({ priceToPixel: price }))
                update.select('.stopLossShading').attr('x', 0).attr('y', yPositions[1]).attr('width', candleDimensions.width).attr('height', yPositions[0] - yPositions[1])
                update.select('.enterBufferShading').attr('x', 0).attr('y', yPositions[2]).attr('width', candleDimensions.width).attr('height', yPositions[1] - yPositions[2])
                update.select('.exitBufferShading').attr('x', 0).attr('y', yPositions[4]).attr('width', candleDimensions.width).attr('height', yPositions[3] - yPositions[4])
                update.select('.moonShading').attr('x', 0).attr('y', yPositions[5]).attr('width', candleDimensions.width).attr('height', yPositions[4] - yPositions[5])


                yPositions.map((position, index) =>
                {
                    update.select(`.${names[index]}`).attr('y1', position).attr('y2', position)
                    update.select(`.${names[index]}Text`).attr('x', startXPosition).attr('y', yPositions[index])
                })
            })
        }



        //trendLine creation and update
        // stockCandleSVG.select('.trendLines').selectAll('.line_group').data(charting.trendLines).join((enter) => createTrendLine(enter), (update) => updateTrendLines(update))
        // function createTrendLine(enter)
        // {
        //     enter.each(function (d)
        //     {
        //         let linePixel = {
        //             point1: { x: createDateScale({ dateToPixel: d.dateP1 }), y: createPriceScale({ priceToPixel: d.priceP1 }) },
        //             point2: { x: createDateScale({ dateToPixel: d.dateP2 }), y: createPriceScale({ priceToPixel: d.priceP2 }) },
        //             point3: { y: createPriceScale({ priceToPixel: d.priceP3 }) },
        //             point4: { y: createPriceScale({ priceToPixel: d.priceP4 }) }
        //         }
        //         var lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today' : 'line_group previous')

        //         lineGroup.append('line').attr('class', 'drawnLineMain').attr('x1', linePixel.point1.x).attr('y1', linePixel.point1.y).attr('x2', linePixel.point2.x).attr('y2', linePixel.point2.y)
        //             .attr('stroke', defaultChartingStyles.trendLineColor).attr('stroke-linecap', 'round').attr('stroke-width', 3)

        //         lineGroup.append('line').attr('class', 'drawnLineMargin').attr('x1', linePixel.point1.x).attr('y1', linePixel.point3.y).attr('x2', linePixel.point2.x).attr('y2', linePixel.point4.y)
        //             .attr('stroke', defaultChartingStyles.trendLineDotted).style("stroke-dasharray", ("3, 3")).attr('stroke-linecap', 'round').attr('stroke-width', defaultChartingStyles.trendLineDottedStroke)

        //         lineGroup.append('circle').attr('class', 'edgeCircle1').attr("cx", linePixel.point1.x).attr("cy", linePixel.point1.y).attr("r", 4).attr('fill', 'red')
        //         lineGroup.append('circle').attr('class', 'edgeCircle2').attr("cx", linePixel.point2.x).attr("cy", linePixel.point2.y).attr("r", 4).attr('fill', 'red')
        //         lineGroup.append('circle').attr('class', 'marginCircle').attr("cx", linePixel.point1.x).attr("cy", linePixel.point3.y).attr("r", 4).attr('fill', 'red')
        //     })
        // }
        // function updateTrendLines(update)
        // {
        //     update.select('.drawnLineMain').each(function (d)
        //     {
        //         let linePixel = {
        //             point1: { x: createDateScale({ dateToPixel: d.dateP1 }), y: createPriceScale({ priceToPixel: d.priceP1 }) },
        //             point2: { x: createDateScale({ dateToPixel: d.dateP2 }), y: createPriceScale({ priceToPixel: d.priceP2 }) },
        //             point3: { y: createPriceScale({ priceToPixel: d.priceP3 }) },
        //             point4: { y: createPriceScale({ priceToPixel: d.priceP4 }) }
        //         }

        //         select(this).attr('x1', linePixel.point1.x).attr('y1', linePixel.point1.y).attr('x2', linePixel.point2.x).attr('y2', linePixel.point2.y)

        //         const parent = select(this.parentNode)
        //         parent.select('.drawnLineMargin').attr('x1', linePixel.point1.x).attr('y1', linePixel.point3.y).attr('x2', linePixel.point2.x).attr('y2', linePixel.point4.y)
        //         parent.select('.edgeCircle1').attr("cx", linePixel.point1.x).attr("cy", linePixel.point1.y)
        //         parent.select('.edgeCircle2').attr("cx", linePixel.point2.x).attr("cy", linePixel.point2.y)
        //         parent.select('.marginCircle').attr("cx", linePixel.point1.x).attr("cy", linePixel.point3.y)
        //     })
        // }

        // //horizontal Line creation and update
        // stockCandleSVG.select('.linesH').selectAll('.line_group').data(charting.linesH).join((enter) => createHorizontalLine(enter), (update) => updateHorizontalLine(update))
        // function createHorizontalLine(enter)
        // {
        //     enter.each(function (d)
        //     {
        //         let priceLinePixel = { pointX: candleDimensions.width * 0.95, pointY: createPriceScale({ priceToPixel: d.priceP1 }) }

        //         var lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today' : 'line_group previous')
        //         lineGroup.append('line').attr('class', 'drawnLine').attr('x1', 0).attr('y1', priceLinePixel.pointY).attr('x2', candleDimensions.width).attr('y2', priceLinePixel.pointY).attr('stroke', defaultChartingStyles.hLineRColor).attr('stroke-width', defaultChartingStyles.hLineStrokeWidth)
        //         lineGroup.append('circle').attr('class', 'edgeCircle').attr('cx', priceLinePixel.pointX).attr("cy", priceLinePixel.pointY).attr("r", 4).attr('fill', 'red')
        //         lineGroup.append('text').attr('class', 'info').text((d) => `$${d.priceP1}`).attr("x", candleDimensions.width).attr("y", priceLinePixel.pointY).attr('dx', '-75px').attr('dy', '20px').attr('font-size', '10px');
        //     })
        // }
        // function updateHorizontalLine(update)
        // {
        //     update.each(function (d)
        //     {
        //         let priceLinePixel = { pointY: createPriceScale({ priceToPixel: d.priceP1 }) }

        //         const parent = select(this)
        //         parent.select('.drawnLine').attr('y1', priceLinePixel.pointY).attr('y2', priceLinePixel.pointY)
        //         parent.select('.edgeCircle').attr('cy', priceLinePixel.pointY)
        //         parent.select('.info').text((d) => `$${d.priceP1}`).attr("x", candleDimensions.width).attr("y", priceLinePixel.pointY)
        //     })
        // }

        //channel creation and update
        // stockCandleSVG.select('.channels').selectAll('.line_group').data(charting.channels).join((enter) => createChannelLine(enter), (update) => updateChannelLine(update))
        // function createChannelLine(enter)
        // {
        //     enter.each(function (d, i)
        //     {
        //         let datePixels = genChannelDatePixelSet(d)
        //         let channelPixel = genPixelSet(d)

        //         var lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today' : 'line_group previous')


        //         lineGroup.append('line').attr('class', 'drawnLine1Main').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point1y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point2y)
        //             .attr('stroke', defaultChartingStyles.channelMainColor).attr('stroke-linecap', 'round').attr('stroke-width', 3)
        //         lineGroup.append('line').attr('class', 'drawnLine1Margin').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point3y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point4y)
        //             .attr('stroke', defaultChartingStyles.channelLineDottedColor).style("stroke-dasharray", ("3, 3")).attr('stroke-linecap', 'round').attr('stroke-width', defaultChartingStyles.trendLineDottedStroke)

        //         lineGroup.append('circle').attr('class', 'edgeCircle1').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point1y).attr("r", 4).attr('fill', 'red')

        //         lineGroup.append('circle').attr('class', 'edgeCircle2').attr("cx", datePixels.rightDatePixel).attr("cy", channelPixel.point2y).attr("r", 4).attr('fill', 'red')
        //         lineGroup.append('circle').attr('class', 'edgeCircleMargin1').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point3y).attr("r", 4).attr('fill', 'red')


        //         //second channel line
        //         lineGroup.append('line').attr('class', 'drawnLine2Main').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point5y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point6y)
        //             .attr('stroke', defaultChartingStyles.channelMainColor).attr('stroke-linecap', 'round').attr('stroke-width', 3)
        //         lineGroup.append('line').attr('class', 'drawnLine2Margin').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point7y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point8y)
        //             .attr('stroke', defaultChartingStyles.channelLineDottedColor).style("stroke-dasharray", ("3, 3")).attr('stroke-linecap', 'round').attr('stroke-width', defaultChartingStyles.trendLineDottedStroke)
        //         lineGroup.append('circle').attr('class', 'edgeCircle3').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point5y).attr("r", 4).attr('fill', 'red')
        //         lineGroup.append('circle').attr('class', 'edgeCircleMargin2').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point7y).attr("r", 4).attr('fill', 'red')
        //     })
        // }
        // function updateChannelLine(update)
        // {
        //     update.each(function (d)
        //     {
        //         let datePixels = genChannelDatePixelSet(d)
        //         let channelPixel = genPixelSet(d)
        //         const parent = select(this)
        //         parent.select('.drawnLine1Main').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point1y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point2y)

        //         parent.select('.drawnLine1Margin').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point3y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point4y)
        //         parent.select('.drawnLine2Main').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point5y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point6y)
        //         parent.select('.drawnLine2Margin').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point7y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point8y)
        //         parent.select('.edgeCircle1').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point1y)
        //         parent.select('.edgeCircle2').attr("cx", datePixels.rightDatePixel).attr("cy", channelPixel.point2y)
        //         parent.select('.edgeCircleMargin1').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point3y)
        //         parent.select('.edgeCircleMargin2').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point7y)

        //         parent.select('.edgeCircle3').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point5y)
        //     })
        // }



        //NEED UPDATED DRAG FUNCTIONS
        //triangle creation and update
        // stockCandleSVG.select('.triangles').selectAll('.line_group').data(charting.triangles).join((enter) => createTriangleLine(enter), (update) => updateTriangleLine(update))
        // function createTriangleLine(enter)
        // {
        //     enter.each(function (d, i)
        //     {
        //         let datePixels = genChannelDatePixelSet(d)
        //         let channelPixel = genPixelSet(d)

        //         var lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today' : 'line_group previous')

        //         lineGroup.append('line').attr('class', 'drawnLine1Main').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point1y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point2y)
        //             .attr('stroke', defaultChartingStyles.channelMainColor).attr('stroke-linecap', 'round').attr('stroke-width', 3)

        //         lineGroup.append('line').attr('class', 'drawnLine1Margin').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point3y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point4y)
        //             .attr('stroke', defaultChartingStyles.channelLineDottedColor).style("stroke-dasharray", ("3, 3")).attr('stroke-linecap', 'round').attr('stroke-width', defaultChartingStyles.trendLineDottedStroke)

        //         lineGroup.append('circle').attr('class', 'edgeCircle1').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point1y).attr("r", 4).attr('fill', 'red')
        //         lineGroup.append('circle').attr('class', 'edgeCircle2').attr("cx", datePixels.rightDatePixel).attr("cy", channelPixel.point2y).attr("r", 4).attr('fill', 'red')

        //         lineGroup.append('circle').attr('class', 'edgeCircleMargin1').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point3y).attr("r", 4).attr('fill', 'red')


        //         //second channel line
        //         lineGroup.append('line').attr('class', 'drawnLine2Main').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point5y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point6y)
        //             .attr('stroke', defaultChartingStyles.channelMainColor).attr('stroke-linecap', 'round').attr('stroke-width', 3)
        //         lineGroup.append('line').attr('class', 'drawnLine2Margin').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point7y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point8y)
        //             .attr('stroke', defaultChartingStyles.channelLineDottedColor).style("stroke-dasharray", ("3, 3")).attr('stroke-linecap', 'round').attr('stroke-width', defaultChartingStyles.trendLineDottedStroke)

        //         lineGroup.append('circle').attr('class', 'edgeCircle3').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point5y).attr("r", 4).attr('fill', 'red')
        //         lineGroup.append('circle').attr('class', 'edgeCircleMargin2').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point7y).attr("r", 4).attr('fill', 'red')

        //     })
        // }
        // function updateTriangleLine(update)
        // {
        //     update.each(function (d)
        //     {
        //         let datePixels = genChannelDatePixelSet(d)
        //         let channelPixel = genPixelSet(d)
        //         const parent = select(this)
        //         parent.select('.drawnLine1Main').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point1y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point2y)

        //         parent.select('.drawnLine1Margin').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point3y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point4y)
        //         parent.select('.drawnLine2Main').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point5y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point6y)
        //         parent.select('.drawnLine2Margin').attr('x1', datePixels.leftDatePixel).attr('y1', channelPixel.point7y).attr('x2', datePixels.rightDatePixel).attr('y2', channelPixel.point8y)
        //         parent.select('.edgeCircle1').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point1y)
        //         parent.select('.edgeCircle2').attr("cx", datePixels.rightDatePixel).attr("cy", channelPixel.point2y)
        //         parent.select('.edgeCircleMargin1').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point3y)
        //         parent.select('.edgeCircleMargin2').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point7y)

        //         parent.select('.edgeCircle3').attr("cx", datePixels.leftDatePixel).attr("cy", channelPixel.point5y)
        //     })
        // }

        //wedge creation and update
        // stockCandleSVG.select('.wedges').selectAll('.line_group').data(charting.wedges).join((enter) => createWedgeLine(enter), (update) => updateWedgeLine(update))
        // function createWedgeLine(enter)
        // {
        //     enter.each(function (d, i)
        //     {
        //         let datePixels = genChannelDatePixelSet(d)
        //         let wedgePixelSet = genPixelSet(d)


        //         var lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today' : 'line_group previous')

        //         lineGroup.append('line').attr('class', 'drawnLine1Main').attr('x1', datePixels.leftDatePixel).attr('y1', wedgePixelSet.point1y).attr('x2', datePixels.rightDatePixel).attr('y2', wedgePixelSet.point2y)
        //             .attr('stroke', defaultChartingStyles.channelMainColor).attr('stroke-linecap', 'round').attr('stroke-width', 3)

        //         lineGroup.append('line').attr('class', 'drawnLine2Main').attr('x1', datePixels.leftDatePixel).attr('y1', wedgePixelSet.point5y).attr('x2', datePixels.rightDatePixel).attr('y2', wedgePixelSet.point6y)
        //             .attr('stroke', defaultChartingStyles.channelMainColor).attr('stroke-linecap', 'round').attr('stroke-width', 3)

        //         lineGroup.append('line').attr('class', 'drawnLine1Margin').attr('x1', datePixels.leftDatePixel).attr('y1', wedgePixelSet.point3y).attr('x2', datePixels.rightDatePixel).attr('y2', wedgePixelSet.point4y)
        //             .attr('stroke', defaultChartingStyles.channelLineDottedColor).style("stroke-dasharray", ("3, 3")).attr('stroke-linecap', 'round').attr('stroke-width', defaultChartingStyles.trendLineDottedStroke)

        //         lineGroup.append('line').attr('class', 'drawnLine2Margin').attr('x1', datePixels.leftDatePixel).attr('y1', wedgePixelSet.point7y).attr('x2', datePixels.rightDatePixel).attr('y2', wedgePixelSet.point8y)
        //             .attr('stroke', defaultChartingStyles.channelLineDottedColor).style("stroke-dasharray", ("3, 3")).attr('stroke-linecap', 'round').attr('stroke-width', defaultChartingStyles.trendLineDottedStroke)


        //         lineGroup.append('circle').attr('class', 'edgeCircle1').attr("cx", datePixels.leftDatePixel).attr("cy", wedgePixelSet.point1y).attr("r", 4).attr('fill', 'red')

        //         lineGroup.append('circle').attr('class', 'edgeCircle2').attr("cx", datePixels.rightDatePixel).attr("cy", wedgePixelSet.point2y).attr("r", 4).attr('fill', 'red')

        //         lineGroup.append('circle').attr('class', 'edgeCircleMargin1').attr("cx", datePixels.leftDatePixel).attr("cy", wedgePixelSet.point3y).attr("r", 4).attr('fill', 'red')

        //         lineGroup.append('circle').attr('class', 'edgeCircleMargin2').attr("cx", datePixels.leftDatePixel).attr("cy", wedgePixelSet.point7y).attr("r", 4).attr('fill', 'red')


        //         if (d?.wedgeHLine)
        //         {
        //             let hWedge = createPriceScale({ priceToPixel: d.wedgeHLine })
        //             lineGroup.append('line').attr('class', 'drawnLineHWedge').attr('x1', datePixels.leftDatePixel).attr('y1', hWedge).attr('x2', datePixels.rightDatePixel).attr('y2', hWedge)
        //                 .attr('stroke', defaultChartingStyles.channelLineDottedColor).style("stroke-dasharray", ("3, 3")).attr('stroke-linecap', 'round').attr('stroke-width', defaultChartingStyles.trendLineDottedStroke)

        //         }
        //     })
        // }
        // function updateWedgeLine(update)
        // {
        //     update.each(function (d)
        //     {
        //         let datePixels = genChannelDatePixelSet(d)
        //         let wedgePixelSet = genPixelSet(d)


        //         const parent = select(this)
        //         parent.select('.drawnLine1Main').attr('x1', datePixels.leftDatePixel).attr('y1', wedgePixelSet.point1y).attr('x2', datePixels.rightDatePixel).attr('y2', wedgePixelSet.point2y)

        //         parent.select('.drawnLine2Main').attr('x1', datePixels.leftDatePixel).attr('y1', wedgePixelSet.point5y).attr('x2', datePixels.rightDatePixel).attr('y2', wedgePixelSet.point6y)
        //         parent.select('.drawnLine1Margin').attr('x1', datePixels.leftDatePixel).attr('y1', wedgePixelSet.point3y).attr('x2', datePixels.rightDatePixel).attr('y2', wedgePixelSet.point4y)
        //         parent.select('.drawnLine2Margin').attr('x1', datePixels.leftDatePixel).attr('y1', wedgePixelSet.point7y).attr('x2', datePixels.rightDatePixel).attr('y2', wedgePixelSet.point8y)

        //         parent.select('.edgeCircle1').attr("cx", datePixels.leftDatePixel).attr("cy", wedgePixelSet.point1y)
        //         parent.select('.edgeCircle2').attr("cx", datePixels.rightDatePixel).attr("cy", wedgePixelSet.point2y)

        //         parent.select('.edgeCircleMargin1').attr("cx", datePixels.leftDatePixel).attr("cy", wedgePixelSet.point3y)
        //         parent.select('.edgeCircleMargin2').attr("cx", datePixels.leftDatePixel).attr("cy", wedgePixelSet.point7y)

        //         parent.select('.edgeCircle3').attr("cx", datePixels.leftDatePixel).attr("cy", wedgePixelSet.point5y)

        //         if (d?.wedgeHLine)
        //         {
        //             let hWedge = createPriceScale({ priceToPixel: d.wedgeHLine })
        //             parent.select('.drawnLineHWedge').attr('x1', datePixels.leftDatePixel).attr('y1', hWedge).attr('x2', datePixels.rightDatePixel).attr('y2', hWedge)

        //         }
        //     })
        // }

        // function genChannelDatePixelSet(d)
        // {
        //     return {
        //         leftDatePixel: createDateScale({ dateToPixel: d.dateP1 }),
        //         rightDatePixel: createDateScale({ dateToPixel: d.dateP2 })
        //     }
        // }
        // function genPixelSet(d)
        // {
        //     return {
        //         point1y: createPriceScale({ priceToPixel: d.priceP1 }),
        //         point2y: createPriceScale({ priceToPixel: d.priceP2 }),
        //         point3y: createPriceScale({ priceToPixel: d.priceP3 }),
        //         point4y: createPriceScale({ priceToPixel: d.priceP4 }),
        //         point5y: createPriceScale({ priceToPixel: d.priceP5 }),
        //         point6y: createPriceScale({ priceToPixel: d.priceP6 }),
        //         point7y: createPriceScale({ priceToPixel: d.priceP7 }),
        //         point8y: createPriceScale({ priceToPixel: d.priceP8 })
        //     }
        // }
    }, [charting, EnterExitPlan, candleData, candleDimensions, currentXZoomState, currentYZoomState])

    //charting visibility
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        let lineGroupClassName = '.line_group'
        let allPossibleClassNames = ['.freeLines', '.linesH', '.trendLines', '.wedges', '.channels', '.triangles', '.enterExits']
        if (chartingVisibility.showAll)
        {
            chartingVisibility.anyFreeLines ? toggleAnyVisible(allPossibleClassNames[0], chartingVisibility.freeLines, chartingVisibility.previousFreeLines) : toggleSelectToHidden(allPossibleClassNames[0],)
            chartingVisibility.anyLinesH ? toggleAnyVisible(allPossibleClassNames[1], chartingVisibility.linesH, chartingVisibility.previousLinesH) : toggleSelectToHidden(allPossibleClassNames[1])
            chartingVisibility.anyTrendLines ? toggleAnyVisible(allPossibleClassNames[2], chartingVisibility.trendLines, chartingVisibility.previousTrendLines) : toggleSelectToHidden(allPossibleClassNames[2])
            chartingVisibility.anyWedges ? toggleAnyVisible(allPossibleClassNames[3], chartingVisibility.wedges, chartingVisibility.previousWedges) : toggleSelectToHidden(allPossibleClassNames[3])
            chartingVisibility.anyChannels ? toggleAnyVisible(allPossibleClassNames[4], chartingVisibility.channels, chartingVisibility.previousChannels) : toggleSelectToHidden(allPossibleClassNames[4])
            chartingVisibility.anyTriangles ? toggleAnyVisible(allPossibleClassNames[5], chartingVisibility.triangles, chartingVisibility.previousTriangles) : toggleSelectToHidden(allPossibleClassNames[5])
            chartingVisibility.anyEnterExits ? toggleAnyVisible(allPossibleClassNames[6], chartingVisibility.enterExits, chartingVisibility.previousEnterExits) : toggleSelectToHidden(allPossibleClassNames[6])
        } else { allPossibleClassNames.map((singleClass, i) => { toggleSelectToHidden(singleClass) }) }


        function toggleAnyVisible(className, showCurrentSpecific, showPreviousSpecific)
        {
            stockCandleSVG.select(className).selectAll(lineGroupClassName).attr('visibility', () => { if (chartingVisibility.showAnyCurrent) return showCurrentSpecific ? 'visible' : 'hidden'; else return 'hidden' })
            stockCandleSVG.select(className).selectAll('.previous').attr('visibility', () => { if (chartingVisibility.showAnyPrevious) return showPreviousSpecific ? 'visible' : 'hidden'; else return 'hidden' })
        }
        function toggleSelectToHidden(className)
        {
            stockCandleSVG.select(className).selectAll(lineGroupClassName).attr('visibility', 'hidden')
        }
    }, [charting, chartingVisibility])

    //configure svg cross hair, context menu, and tool interactions
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        initializeMouseCrossHairBehavior()
        if (!stockCandleSVG.on('contextmenu')) { stockCandleSVG.on('contextmenu', (e) => { e.preventDefault(); setShowContextMenu({ display: true, style: { left: `${e.offsetX}px`, top: `${e.offsetY}px` } }) }) }

        let toolingFunction = toolFunctionExports[ChartingTools.findIndex(t => t.tool === currentTool)]
        stockCandleSVG.on('click', (e) => toolingFunction(e, setEnableZoom, candleSVG.current, pixelSet, setCaptureComplete, createDateScale, createPriceScale))

    }, [currentTool, candleDimensions, candleData, currentXZoomState, currentYZoomState])


    //update charting state post trace
    useEffect(() =>
    {
        if (!captureComplete || preDimensionsAndCandleCheck()) return

        let completeCapture = {}
        let pixelCapture = pixelSet.current
        completeCapture.dateP1 = createDateScale({ pixelToDate: pixelCapture.X1 })
        if (currentTool === 'Enter Exit')
        {

            completeCapture.enterPrice = createPriceScale({ pixelToPrice: pixelCapture.Y1 })
            completeCapture.enterBufferPrice = createPriceScale({ pixelToPrice: pixelCapture.Y2 })
            completeCapture.stopLossPrice = createPriceScale({ pixelToPrice: pixelCapture.Y3 })

            completeCapture.exitPrice = createPriceScale({ pixelToPrice: pixelCapture.Y4 })
            completeCapture.exitBufferPrice = createPriceScale({ pixelToPrice: pixelCapture.Y5 })
            completeCapture.moonPrice = createPriceScale({ pixelToPrice: pixelCapture.Y6 })

            completeCapture.percents = [pixelCapture.P1, pixelCapture.P2, pixelCapture.P3, pixelCapture.P4, pixelCapture.P5]

            if (EnterExitPlan)
            {
                //enter exit plan exist with an ID attached to Enter Exit Plan
                dispatch(defineEnterExitPlan({ ticker, enterExitPlan: completeCapture }))
                //attemptToUpdateEnterExit({ ticker, chartId, update: completeCapture, id: EnterExitPlan.id })
            } else
            {
                dispatch(addEnterExitToCharting({ ticker, enterExit: completeCapture }))
                //enter exit plan does not exist and enter exit gets added to charting
                //add to charting
                //button shows up to inititate tracking//move enter exit from charting to actual enter/exit plan with tracking
            }




        } else
        {
            completeCapture.dateP2 = createDateScale({ pixelToDate: pixelCapture.X2 })
            Object.keys(pixelSet.current).filter(t => t.includes('Y')).map((pixelForPrice, i) => { completeCapture[`priceP${i + 1}`] = createPriceScale({ pixelToPrice: pixelCapture[pixelForPrice] }) })

            switch (currentTool)
            {
                case ChartingTools[1].tool: dispatch(addLine({ line: completeCapture, ticker })); break;
                // case ChartingTools[2].tool: dispatch(addLine({ line: completeCapture, ticker })); break;
            }
        }
        resetTemp()

    }, [currentTool, captureComplete])

    //toggle edit visual aids
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        switch (editMode)
        {
            case ChartingToolEdits[0].editTool:
                stockCandleSVG.select('.enterExits').selectAll('.edit').attr('visibility', 'visible').call(dragEnterExitBehavior);
                break;
            default:
                stockCandleSVG.select('.enterExits').selectAll('.edit').attr('visibility', 'hidden').call(dragEnterExitBehavior);
                break;
        }


    }, [editMode])


    async function attemptToUpdateEnterExit(args)
    {
        try
        {
            await updateEnterExitPlan(args)
        } catch (error)
        {

        }
    }


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

    function resetTemp()
    {
        stockCandleSVG.select('.temp').selectAll('.traceLine').remove()
        pixelSet.current = initialPixelSet
        setEnableZoom(true)
        initializeMouseCrossHairBehavior()
    }


    //keyboard event listeners
    useEffect(() =>
    {
        if (!captureComplete) { document.addEventListener('keydown', (e) => { resetTempBeforeCompletion(e); deleteSelectedEditChartElement(e) }) } else { document.removeEventListener('keydown', resetTempBeforeCompletion) }

        function resetTempBeforeCompletion(e)
        {
            if (e.key === 'Escape')
            {
                if (document.activeElement.tagName.toLowerCase() === 'input' || document.activeElement.tagName.toLowerCase() === 'textarea') return;
                e.preventDefault()
                resetTemp()
            }
        }
        function deleteSelectedEditChartElement(e)
        {
            if (e.key === 'Delete')
            {
                if (document.activeElement.tagName.toLowerCase() === 'input' || document.activeElement.tagName.toLowerCase() === 'textarea') return;
                e.preventDefault()
                dispatch(removeChartingElement({ ...editChartElement, ticker }))
            }
        }

        return (() => { document.removeEventListener('keydown', resetTempBeforeCompletion) })
    }, [editChartElement, captureComplete])

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
    }, [candleData, enableZoom, candleDimensions, timeFrame])

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
    }, [candleData, priceDimensions, timeFrame])




    let dragPixelCopy = {}
    function genX1X2PixelSet(d)
    {
        dragPixelCopy.X1 = xScaleRef.current({ dateToPixel: d.dateP1 })
        dragPixelCopy.X2 = xScaleRef.current({ dateToPixel: d.dateP2 });
        Object.keys(d).filter(t => t.includes('price')).map((price, i) => { dragPixelCopy[`Y${i + 1}`] = yScaleRef.current({ priceToPixel: d[price] }) })

    }
    function genX1X2PixelChange(e, d)
    {
        dragPixelCopy.X1 = dragPixelCopy.X1 + e.dx;
        dragPixelCopy.X2 = dragPixelCopy.X2 + e.dx;
        Object.keys(dragPixelCopy).filter(t => t.includes('Y')).map((price, i) => { dragPixelCopy[`Y${i + 1}`] = dragPixelCopy[`Y${i + 1}`] + e.dy })
    }




    function dragWholeLineStarted(e, d)
    {
        genX1X2PixelSet(d)
        setEditChartElement({ chartingElement: d, group: 'freeLines' })
        select(this).attr('stroke', 'blue').attr('stroke-width', 3)
    }
    function draggedWholeLine(e, d)
    {
        genX1X2PixelChange(e, d)
        const parent = select(this.parentNode)
        select(this).attr('x1', dragPixelCopy.X1).attr('y1', dragPixelCopy.Y1).attr('x2', dragPixelCopy.X2).attr('y2', dragPixelCopy.Y2)
        parent.select('.edgeCircle1').attr('cx', dragPixelCopy.X1).attr('cy', dragPixelCopy.Y1);
        parent.select('.edgeCircle2').attr('cx', dragPixelCopy.X2).attr('cy', dragPixelCopy.Y2)
    }
    function dragWholeLineEnded(e, d)
    {
        select(this).attr('stroke', 'black')

        dispatch(updateLine({
            ticker: tickerRef.current, update: {
                ...d, dateP1: xScaleRef.current({ pixelToDate: dragPixelCopy.X1 }), priceP1: yScaleRef.current({ pixelToPrice: dragPixelCopy.Y1 }),
                dateP2: xScaleRef.current({ pixelToDate: dragPixelCopy.X2 }), priceP2: yScaleRef.current({ pixelToPrice: dragPixelCopy.Y2 })
            }
        }))
    }
    const dragBehavior = drag().on('start', dragWholeLineStarted).on('drag', draggedWholeLine).on('end', dragWholeLineEnded)




    function dragEnterExitLineVertStart(e, d)
    {
        dragPixelCopy.lineColor = select(this).attr('stroke')

        let yPrice
        switch (select(this).attr('class'))
        {
            case 'enterLine edit': dragPixelCopy.textClass = '.enterLineText'; yPrice = d.enterPrice; break;
            case 'enterBufferLine edit': dragPixelCopy.textClass = '.enterBufferLineText'; yPrice = d.enterBufferPrice; break;
            case 'stopLossLine edit': dragPixelCopy.textClass = '.stopLossLineText'; yPrice = d.stopLossPrice; break;
            case 'exitLine edit': dragPixelCopy.textClass = '.exitLineText'; yPrice = d.exitPrice; break;
            case 'exitBufferLine edit': dragPixelCopy.textClass = '.exitBufferLineText'; yPrice = d.exitBufferPrice; break;
            case 'moonLine edit': dragPixelCopy.textClass = '.moonLineText'; yPrice = d.moonPrice; break;
        }

        dragPixelCopy.Y1 = yScaleRef.current({ priceToPixel: yPrice })
    }
    function dragEnterExitVertLine(e, d)
    {
        dragPixelCopy.Y1 = dragPixelCopy.Y1 + e.dy;
        select(this).attr('y1', dragPixelCopy.Y1).attr('y2', dragPixelCopy.Y1).attr('x1', 0).attr('x2', 5000)

        // const parent = select(this.parentNode)
        // parent.select(dragPixelCopy.textClass).attr('y', dragPixelCopy.Y1).text((d) => `$${yScaleRef.current({ pixelToPrice: dragPixelCopy.Y1 })}`)
    }
    function dragEnterExitVertLineEnd(e, d)
    {
        //        select(this).attr('stroke', dragPixelCopy.lineColor).attr('x1', () => xScaleRef.current({ dateToPixel: d.enterDate })).attr('x2', () => createDateScale({ dateToPixel: d.enterDate }) + 100)


        let update = { ...d }
        let updatedPriceForY1 = yScaleRef.current({ pixelToPrice: dragPixelCopy.Y1 })
        switch (dragPixelCopy.textClass)
        {
            case '.stopLossLineText': update.stopLossPrice = updatedPriceForY1; break;
            case '.enterLineText': update.enterPrice = updatedPriceForY1; break;
            case '.enterBufferLineText': update.enterBufferPrice = updatedPriceForY1; break;
            case '.exitBufferLineText': update.exitBufferPrice = updatedPriceForY1; break;
            case '.exitLineText': update.exitPrice = updatedPriceForY1; break;
            case '.moonLineText': update.moonPrice = updatedPriceForY1; break;
        }

        if (EnterExitPlan)
        {
            console.log('Need to put in place update for tracking enter exit')
            dispatch(defineEnterExitPlan({ ticker, enterExitPlan: update }))
        } else
        {
            console.log('updating local charting copy of enter exit')
            dispatch(updateEnterExitToCharting({ updatedEnterExit: update, ticker }))
        }
    }
    const dragEnterExitBehavior = drag().on('start', dragEnterExitLineVertStart).on('drag', dragEnterExitVertLine).on('end', dragEnterExitVertLineEnd)



    return (
        <div className='SVGGraphWrapper'>
            {showContextMenu.display && <ChartContextMenuContainer showContextMenu={showContextMenu} setShowContextMenu={setShowContextMenu} />}

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