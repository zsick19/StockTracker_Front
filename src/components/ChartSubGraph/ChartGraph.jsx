import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addEnterExitToCharting, addLine, addVolumeNode, makeSelectChartingByTicker, removeChartingElement, updateEnterExitToCharting, updateLine } from '../../features/Charting/chartingElements'
import { useResizeObserver } from '../../hooks/useResizeObserver'
import { scaleDiscontinuous, discontinuityRange, discontinuitySkipUtcWeekends } from '@d3fc/d3fc-discontinuous-scale'
import { sub, addDays, isToday, subMonths, addYears, subDays, startOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, isSaturday, isSunday } from 'date-fns'
import
{
    select, drag, zoom, zoomTransform, axisBottom, axisLeft, path, scaleTime, min, max, line, timeDay,
    curveBasis, timeWeek, scaleLog, scaleLinear, scaleBand, extent, timeMonth, group, timeMonths, timeDays, zoomIdentity,
    curveBasisOpen,
    curveLinear
} from 'd3'
import { pixelBuffer } from './GraphChartConstants'
import { makeSelectKeyLevelsByTicker, selectTickerKeyLevels } from '../../features/KeyLevels/KeyLevelGraphElements'
import { defineEnterExitPlan, makeSelectEnterExitByTicker } from '../../features/EnterExitPlans/EnterExitGraphElement'
import { selectCurrentTool } from '../../features/Charting/ChartingTool'
import { selectChartVisibility } from '../../features/Charting/ChartingVisibility'
import { toolFunctionExports } from '../../Utilities/graphChartingFunctions'
import ChartContextMenuContainer from './contextMenus/ChartContextMenuContainer'
import { ChartingToolEdits, ChartingTools } from '../../Utilities/ChartingTools'
import { defaultChartingStyles } from '../../Utilities/GraphStyles'
import { lineHover, lineNoHover } from '../../Utilities/chartingHoverFunctions'
import { useUpdateEnterExitPlanMutation } from '../../features/EnterExitPlans/EnterExitApiSlice'
import { selectChartEditMode } from '../../features/Charting/EditChartSelection'
import { generateTradingHours, getBreaksBetweenDates } from '../../Utilities/TimeFrames'
import { makeSelectZoomStateByUUID, setXZoomState, setYZoomState } from '../../features/Charting/GraphHoverZoomElement'
import { calculateEMADataPoints } from '../../Utilities/technicalIndicatorFunctions'
import { makeSelectGraphStudyByUUID } from '../../features/Charting/GraphStudiesVisualElement'

function ChartGraph({ ticker, candleData, chartId, mostRecentPrice, timeFrame, setTimeFrame, isLivePrice, isInteractive, isZoomAble, initialTracking, uuid, lastCandleData, candlesToKeepSinceLastQuery, showEMAs })
{
    const dispatch = useDispatch()

    const [updateEnterExitPlan] = useUpdateEnterExitPlanMutation()
    async function attemptToUpdateEnterExit()
    {
        try
        {
            await updateEnterExitPlan({ ticker, chartId })
        } catch (error)
        {
            console.log(error)
        }
    }
    //redux charting data selectors

    const selectKeyLevelMemo = useMemo(makeSelectKeyLevelsByTicker, [ticker])
    const KeyLevels = useSelector((state) => selectKeyLevelMemo(state, ticker))



    const selectedEnterExitMemo = useMemo(makeSelectEnterExitByTicker, [])
    const EnterExitPlan = useSelector(state => selectedEnterExitMemo(state, ticker))


    const selectedChartingMemo = useMemo(makeSelectChartingByTicker, [])
    const charting = useSelector(state => selectedChartingMemo(state, ticker))


    const selectedStudyVisualStateMemo = useMemo(makeSelectGraphStudyByUUID, [])
    const studyVisualController = useSelector((state) => selectedStudyVisualStateMemo(state, uuid))

    const editMode = useSelector(selectChartEditMode)





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
    const selectedChartZoomStateMemo = useMemo(makeSelectZoomStateByUUID, [])
    const chartZoomState = useSelector(state => selectedChartZoomStateMemo(state, uuid))
    const [enableZoom, setEnableZoom] = useState(true)

    //chart scale creation
    const minPrice = useMemo(() => min(candleData, d => d.LowPrice), [candleData])
    const maxPrice = useMemo(() => max(candleData, d => d.HighPrice), [candleData])



    const ema9Values = useMemo(() => calculateEMADataPoints(candleData, 9), [candleData])
    const ema50Values = useMemo(() => calculateEMADataPoints(candleData, 50), [candleData])
    const ema200Values = useMemo(() => calculateEMADataPoints(candleData, 200), [candleData])

    const VWAPLine = line().x(d => createDateScale({ dateToPixel: d.Timestamp })).y(d => createPriceScale({ priceToPixel: d.VWAP })).curve(curveLinear)
    const emaLine = line().x(d => createDateScale({ dateToPixel: d.date })).y(d => createPriceScale({ priceToPixel: d.value })).curve(curveLinear)



    const excludedPeriods = useMemo(() => { if (timeFrame.intraDay) return generateTradingHours(timeFrame) }, [timeFrame])
    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        let startDate
        let futureForwardEndDate

        if (timeFrame.intraDay)
        {
            startDate = new Date()
            if (isSaturday(startDate)) startDate = subDays(startDate, 1)
            if (isSunday(startDate)) startDate = subDays(startDate, 2)
            startDate.setHours(5, 30, 0, 0)
            futureForwardEndDate = new Date()
        } else if (timeFrame.unitOfDuration === 'Y')
        {
            startDate = sub(new Date(), { days: 365 })
            futureForwardEndDate = addDays(new Date(), 2)
        }
        else if (timeFrame.unitOfDuration === 'D')
        {
            startDate = sub(new Date(), { days: timeFrame.duration })
            futureForwardEndDate = addDays(new Date(), 4)
        }

        let xDateScale = null
        if (timeFrame.intraDay)
        {

            xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuityRange(...excludedPeriods)).domain([startDate, futureForwardEndDate]).range([0, candleDimensions.width])

        }
        else
        {
            xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuitySkipUtcWeekends()).domain([startDate, futureForwardEndDate]).range([0, candleDimensions.width])
        }



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

    }, [candleData, chartZoomState?.x, candleDimensions, timeFrame])

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

        if (chartZoomState?.y)
        {
            const zoomValues = zoomIdentity.translate(chartZoomState.y.x, chartZoomState.y.y).scale(chartZoomState.y.k)
            const newZoomScale = zoomValues.rescaleY(yScale)
            yScale.domain(newZoomScale.domain())
        }

        if (pixelToPrice !== undefined) return Math.round(yScale.invert(pixelToPrice) * 100) / 100
        else if (priceToPixel !== undefined)
        {
            return yScale(priceToPixel)
        }
        else return yScale

    }, [candleData, chartZoomState?.y, priceDimensions])

    //scaleRefs for user charting drag functionality
    const yScaleRef = useRef()
    yScaleRef.current = createPriceScale
    const xScaleRef = useRef()
    xScaleRef.current = createDateScale
    const tickerRef = useRef()
    tickerRef.current = ticker


    const stockCandleSVG = select(candleSVG.current)
    const priceScaleSVG = select(priceSVG.current)

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

    //plot stock candles and initial tracking info
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        let xAxis
        const yAxis = axisLeft(createPriceScale())
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

        priceScaleSVG.select('.y-axis').style('transform', `translateX(${priceDimensions.width - 1}px)`).call(yAxis)
        try
        {
            stockCandleSVG.select('.x-axis').style('transform', `translateY(${candleDimensions.height - pixelBuffer.yDirectionPixelBuffer}px)`).call(xAxis)
        } catch (error)
        {
            console.log(error)
        }


        stockCandleSVG.select('.tickerVal').selectAll('.candle').data(candleData, d => d.Timestamp).join(enter => createCandles(enter), update => updateCandles(update))
        function createCandles(enter)
        {
            enter.each(function (d, i)
            {
                var tickerGroups = select(this).append('g').attr('class', 'candle')
                tickerGroups.append('line').attr('class', 'lowHigh').attr('stroke', 'black').attr('stroke-width', 1).attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                tickerGroups.append('line').attr('class', 'openClose').attr('stroke', (d, i) => { return d.OpenPrice < d.ClosePrice ? 'green' : 'red' }).attr('stroke-width', 2).attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
                tickerGroups.attr("transform", (d) => { return `translate(${createDateScale({ dateToPixel: d.Timestamp })},0)` })
            })
        }
        function updateCandles(update)
        {
            update.each(function (d, i)
            {
                const candle = select(this)
                candle.attr("transform", (d) => { return `translate(${createDateScale({ dateToPixel: d.Timestamp })},0)` })
                candle.select('.lowHigh').attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                candle.select('.openClose').attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
            })
        }




        stockCandleSVG.select('.initialTrack').selectAll('line').remove()

        if (initialTracking)
        {
            let pixelPrice = createPriceScale({ priceToPixel: initialTracking.price })
            let pixelDate = createDateScale({ dateToPixel: initialTracking.date })

            let trackingLines = stockCandleSVG.select('.initialTrack')
            trackingLines.append('line').attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', pixelPrice).attr('y2', pixelPrice)
                .attr('stroke', 'green')
                .attr('stroke-width', '0.5px')
                .attr('stroke-dasharray', '5 2 5')
                .attr('opacity', 0.75)

            trackingLines.append('line').attr('x1', pixelDate).attr('x2', pixelDate)
                .attr('y1', 0).attr('y2', candleDimensions.height)
                .attr('stroke', 'green')
                .attr('stroke-width', '0.5px')
                .attr('stroke-dasharray', '5 2 5')
                .attr('opacity', 0.75)

        }

    }, [candleData, EnterExitPlan, candleDimensions, chartZoomState?.x, chartZoomState?.y, timeFrame])

    //plot EMA and VWAP lines
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        if (studyVisualController?.ema || showEMAs)
        {

            stockCandleSVG.select('.vwap').attr('d', VWAPLine(candleData)).attr('stroke', 'purple').attr('fill', 'none').attr('stroke-width', '1px')

            const ema = stockCandleSVG.select('.emaLines')
            ema.selectAll('.ema9').data([ema9Values], d => d.Timestamp).join(enter =>
                enter.append('path').attr('class', 'periodLines ema9').attr('stroke', 'green').attr('fill', 'none').attr('stroke-width', '1px').attr('d', d => emaLine(d)),
                update => update.attr('d', d => emaLine(d)))

            ema.selectAll('.ema50').data([ema50Values], d => d.Timestamp).join(enter =>
                enter.append('path').attr('class', 'periodLines ema50').attr('stroke', 'blue').attr('fill', 'none').attr('stroke-width', '1px').attr('d', d => emaLine(d)),
                update => update.attr('d', d => emaLine(d))
            )

            ema.selectAll('.ema200').data([ema200Values], d => d.Timestamp).join(enter =>
                enter.append('path').attr('class', 'periodLines ema50').attr('stroke', 'red').attr('fill', 'none').attr('stroke-width', '1px').attr('d', d => emaLine(d)),
                update => update.attr('d', d => emaLine(d))
            )
        } else
        {
            stockCandleSVG.select('.emaLines').selectAll('.periodLines').remove()
        }
    }, [studyVisualController, candleDimensions, chartZoomState?.x, chartZoomState?.y, candleData])



    //draw visual time breaks
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        if (timeFrame.intraDay)
        {
            stockCandleSVG.select('.visualDateBreaks').selectAll('.visualBreak').remove()
            stockCandleSVG.select('.visualDateBreaks').selectAll('.preMarketVisualBreak').data([...visualBreaksPeriods.preMarket]).join(enter => createMarketOpenVisualBreaks(enter), update => updateMarketOpenVisualBreaks(update))
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
                        .attr('height', candleDimensions.height)


                    visualBreakGroups.append('rect').attr('class', 'afterMarket')
                        .attr('x', (d, i) => marketClose).attr('y', -pixelBuffer.yDirectionPixelBuffer)
                        .attr('width', (d) => createDateScale({ dateToPixel: visualBreaksPeriods.afterMarket[i] }) - marketClose)
                        .attr('height', candleDimensions.height)
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
        } else
        {

            let pixelDates = visualBreaksPeriods.months.map((d) => createDateScale({ dateToPixel: d }))
            stockCandleSVG.select('.visualDateBreaks').selectAll('.preMarketVisualBreak').remove()
            stockCandleSVG.select('.visualDateBreaks').selectAll('.visualBreak').remove()
            stockCandleSVG.select('.visualDateBreaks').selectAll('.visualBreak').data(visualBreaksPeriods.months).join(enter => createVisualBreaks(enter))
            function createVisualBreaks(enter)
            {
                enter.append('rect').attr('class', (d, i) => { return i % 2 !== 0 ? 'monthOdd visualBreak' : 'monthEven visualBreak' })
                    .attr('x', (d, i) => createDateScale({ dateToPixel: d })).attr('y', -pixelBuffer.yDirectionPixelBuffer)
                    .attr('width', (d, i) => { return pixelDates[i + 1] - createDateScale({ dateToPixel: d }) })
                    .attr('height', candleDimensions.height)
            }

        }

    }, [candleDimensions, chartZoomState?.x, chartZoomState?.y, timeFrame])

    //plot previous candle Data and live price
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !candlesToKeepSinceLastQuery || !lastCandleData) return

        stockCandleSVG.select('.lastCandleUpdate').selectAll('.previousCandles').data(candlesToKeepSinceLastQuery, d => d.Timestamp).join(enter => createPreviousCandles(enter), update => updatePreviousCandles(update))
        function createPreviousCandles(enter)
        {
            enter.each(function (d, i)
            {
                var tickerGroups = select(this).append('g').attr('class', 'previousCandles')
                tickerGroups.append('line').attr('class', 'lowHigh').attr('stroke', 'black').attr('stroke-width', 1).attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                tickerGroups.append('line').attr('class', 'openClose').attr('stroke', (d, i) => { return d.OpenPrice < d.ClosePrice ? 'green' : 'red' }).attr('stroke-width', 2).attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
                tickerGroups.attr("transform", (d) => { return `translate(${createDateScale({ dateToPixel: d.Timestamp })},0)` })
            })
        }
        function updatePreviousCandles(update)
        {
            update.each(function (d, i)
            {
                const candle = select(this)
                candle.attr("transform", (d) => { return `translate(${createDateScale({ dateToPixel: d.Timestamp })},0)` })
                candle.select('.lowHigh').attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                candle.select('.openClose').attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
            })
        }

        stockCandleSVG.select('.lastCandleUpdate').selectAll('.veryLastCandle').data([lastCandleData]).join(enter => createCandles(enter), update => updateCandles(update))
        function createCandles(enter)
        {
            enter.each(function (d, i)
            {
                var tickerGroups = select(this).append('g').attr('class', 'veryLastCandle')
                tickerGroups.append('line').attr('class', 'lowHigh').attr('stroke', 'black')
                    .attr('stroke-width', 1).attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                tickerGroups.append('line').attr('class', 'openClose').attr('stroke', (d, i) => { return d.OpenPrice < d.ClosePrice ? 'green' : 'red' })
                    .attr('stroke-width', 2).attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
                tickerGroups.attr("transform", (d) => { return `translate(${createDateScale({ dateToPixel: d.Timestamp })},0)` })

                let pixelPrice = createPriceScale({ priceToPixel: d.ClosePrice })
                tickerGroups.append('line').attr('class', 'livePrice')
                    .attr('x1', -5000).attr('x2', candleDimensions.width)
                    .attr('y1', pixelPrice).attr('y2', pixelPrice)
                    .attr('stroke', 'green')
                    .attr('stroke-width', '1px')
                    .attr('stroke-dasharray', '5 5')
                select(this).append('text').attr('class', 'livePriceText').attr('color', 'white')
                    .text(`$${d.ClosePrice}`).attr("x", candleDimensions.width - 75).attr("y", pixelPrice);
            })
        }
        function updateCandles(update)
        {
            update.each(function (d, i)
            {
                const candle = select(this)
                candle.attr("transform", (d) => { return `translate(${createDateScale({ dateToPixel: d.Timestamp })},0)` })
                candle.select('.lowHigh').attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                candle.select('.openClose').attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice })).attr('stroke', (d, i) => { return d.OpenPrice < d.ClosePrice ? 'green' : 'red' })

                let pixelPrice = createPriceScale({ priceToPixel: d.ClosePrice })
                candle.select('.livePrice').attr('y1', pixelPrice).attr('y2', pixelPrice)
                stockCandleSVG.select('.lastCandleUpdate').select('.livePriceText').text(`$${d.ClosePrice}`).attr('y', pixelPrice)
            })

        }

    }, [lastCandleData, candlesToKeepSinceLastQuery, candleDimensions, chartZoomState?.x, chartZoomState?.y, timeFrame])

    //plot most recent price 
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !mostRecentPrice || isLivePrice) return


        let pixelPrice = createPriceScale({ priceToPixel: mostRecentPrice.Price })
        stockCandleSVG.select('.currentPrice').selectAll('line').data([mostRecentPrice.Price]).join(enter =>
            enter.append('line').attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', pixelPrice).attr('y2', pixelPrice)
                .attr('stroke', 'blue')
                .attr('stroke-width', '1px')
                .attr('stroke-dasharray', '5 5'),
            update => update.attr('y1', createPriceScale({ priceToPixel: mostRecentPrice.Price })).attr('y2', createPriceScale({ priceToPixel: mostRecentPrice.Price }))
        )

    }, [mostRecentPrice, candleData, chartZoomState?.x, chartZoomState?.y, timeFrame])



    //plot user charting  
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !charting) return
        console.log(!EnterExitPlan, EnterExitPlan)
        if (!EnterExitPlan) stockCandleSVG.select('.enterExit').selectAll('.line_group').remove()

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
        if (charting?.enterExitLines && !EnterExitPlan) { stockCandleSVG.select('.enterExits').selectAll('.line_group').data([charting.enterExitLines]).join((enter) => createEnterExit(enter), (update) => updateEnterExit(update)) }
        function createEnterExit(enter)
        {
            enter.each(function (d)
            {
                var lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today chartingEnterExit' : 'line_group previous chartingEnterExit')

                const names = ['stopLossLine', 'enterLine', 'enterBufferLine', 'exitBufferLine', 'exitLine', 'moonLine']
                const lineColors = ['green', 'yellow', 'red', 'yellow', 'green', 'black']

                const yPositions = [d.stopLossPrice, d.enterPrice, d.enterBufferPrice, d.exitBufferPrice, d.exitPrice, d.moonPrice].map((price) => yScaleRef.current({ priceToPixel: price }))
                lineGroup.append('rect').attr('class', 'stopLossShading').attr('x', 0).attr('y', yPositions[1]).attr('width', candleDimensions.width).attr('height', yPositions[0] - yPositions[1]).attr('fill', 'red').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'enterBufferShading').attr('x', 0).attr('y', yPositions[2]).attr('width', candleDimensions.width).attr('height', yPositions[1] - yPositions[2]).attr('fill', 'yellow').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'exitBufferShading').attr('x', 0).attr('y', yPositions[4]).attr('width', candleDimensions.width).attr('height', yPositions[3] - yPositions[4]).attr('fill', 'green').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'moonShading').attr('x', 0).attr('y', yPositions[5]).attr('width', candleDimensions.width).attr('height', yPositions[4] - yPositions[5]).attr('fill', 'blue').attr('opacity', 0.1)

                yPositions.map((position, index) =>
                {
                    lineGroup.append('line').attr('class', `${names[index]} edit`)
                        .attr('x1', 0).attr('x2', 5000).attr('y1', position).attr('y2', position).attr('stroke', lineColors[index])
                        .attr('stroke-width', 10).attr('visibility', 'hidden').on('mouseover', function (e, d) { setEditChartElement({ chartingElement: d, group: 'enterExitLines' }); })

                    //      lineGroup.append('text').attr('class', `${names[index]}Text`).attr('x', startXPosition).attr('y', position).text((d) => `$${100}`)
                })
            })
        }
        function updateEnterExit(update)
        {

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
                    update.select(`.${names[index]}Text`).attr('x', candleDimensions.width * 0.9).attr('y', yPositions[index])
                })
            })
        }

        if (charting?.lowVolumeNodes)
        {
            stockCandleSVG.select('.lowVolumeNodes').selectAll('.line_group').data(charting.lowVolumeNodes).join((enter) => createLowVolumeNode(enter), update => updateLowVolumeNode(update))
            function createLowVolumeNode(enter)
            {
                enter.each(function (d)
                {
                    const pricePixel = createPriceScale({ priceToPixel: d.price })
                    select(this).append('line').attr('class', (d, i) => isToday(d.dateCreated) ? `line_group today chartingLowVolNode` : `line_group previous chartingLowVolNode`)
                        .attr('x1', 0).attr('x2', 5000).attr('y1', pricePixel).attr('y2', pricePixel + 0.1).attr('stroke', 'url(#fadeLowVolume)')
                        .attr('stroke-width', 20).on('mouseover', function (e, d) { setEditChartElement({ chartingElement: d, group: 'lowVolumeNodes' }); })
                })
            }
            function updateLowVolumeNode(update)
            {
                update.each(function (d, i)
                {
                    const pricePixel = createPriceScale({ priceToPixel: d.price })
                    select(this).attr('y1', pricePixel).attr('y2', pricePixel + 0.1)
                })
            }
        }
        if (charting?.highVolumeNodes)
        {
            stockCandleSVG.select('.highVolumeNodes').selectAll('.line_group').data(charting.highVolumeNodes).join((enter) => createHighVolumeNode(enter), update => updateHighVolumeNode(update))
            function createHighVolumeNode(enter)
            {
                enter.each(function (d)
                {
                    const pricePixel = createPriceScale({ priceToPixel: d.price })
                    select(this).append('line').attr('class', (d, i) => isToday(d.dateCreated) ? `line_group today chartingHighVolNode` : `line_group previous chartingHighVolNode`)
                        .attr('x1', 0).attr('x2', 5000).attr('y1', pricePixel).attr('y2', pricePixel + 0.1).attr('stroke', 'url(#fadeHighVolume)')
                        .attr('stroke-width', 20).on('mouseover', function (e, d) { setEditChartElement({ chartingElement: d, group: 'highVolumeNodes' }); })
                })
            }
            function updateHighVolumeNode(update)
            {
                update.each(function (d, i)
                {
                    const pricePixel = createPriceScale({ priceToPixel: d.price })
                    select(this).attr('y1', pricePixel).attr('y2', pricePixel + 0.1)
                })
            }
        }

    }, [ticker, chartId, charting, candleData, candleDimensions, chartZoomState?.x, chartZoomState?.y,])


    //plot user EnterExit Plan removing any possible charting enter exit  
    useEffect(() =>
    {
        if (!EnterExitPlan) stockCandleSVG.select('.enterExit').selectAll('.line_group').remove()

        if (preDimensionsAndCandleCheck() || !EnterExitPlan) return

        //enter exit plan creation and update
        // stockCandleSVG.select('.enterExit').select('.twoPercentLine').remove()

        stockCandleSVG.select('.enterExits').selectAll('.line_group').data([EnterExitPlan]).join((enter) => createEnterExit(enter), (update) => updateEnterExit(update))
        function createEnterExit(enter)
        {
            const names = ['stopLossLine', 'enterLine', 'enterBufferLine', 'exitBufferLine', 'exitLine', 'moonLine']
            const lineColors = ['green', 'yellow', 'red', 'yellow', 'green', 'black']
            enter.each(function (d)
            {
                var lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today' : 'line_group previous')

                const yPositions = [d.stopLossPrice, d.enterPrice, d.enterBufferPrice, d.exitBufferPrice, d.exitPrice, d.moonPrice].map((price) => yScaleRef.current({ priceToPixel: price }))
                lineGroup.append('rect').attr('class', 'stopLossShading').attr('x', 0).attr('y', yPositions[1]).attr('width', candleDimensions.width).attr('height', yPositions[0] - yPositions[1]).attr('fill', 'red').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'enterBufferShading').attr('x', 0).attr('y', yPositions[2]).attr('width', candleDimensions.width).attr('height', yPositions[1] - yPositions[2]).attr('fill', 'yellow').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'exitBufferShading').attr('x', 0).attr('y', yPositions[4]).attr('width', candleDimensions.width).attr('height', yPositions[3] - yPositions[4]).attr('fill', 'green').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'moonShading').attr('x', 0).attr('y', yPositions[5]).attr('width', candleDimensions.width).attr('height', yPositions[4] - yPositions[5]).attr('fill', 'blue').attr('opacity', 0.1)

                let twoPercentAboveEnter = createPriceScale({ priceToPixel: (d.enterPrice + (d.enterPrice * 0.02)) })
                lineGroup.append('line').attr('class', `twoPercentLine`).attr('x1', 0).attr('x2', 5000)
                    .attr('y1', twoPercentAboveEnter).attr('y2', twoPercentAboveEnter).attr('stroke', 'purple').attr('stroke-dasharray', '3 10 3')

                yPositions.map((position, index) =>
                {
                    lineGroup.append('line').attr('class', `${names[index]} edit`).attr('x1', 0).attr('x2', 5000).attr('y1', position).attr('y2', position).attr('stroke', lineColors[index])
                        .attr('stroke-width', 10).attr('visibility', 'hidden').on('mouseover', function (e, d) { setEditChartElement({ chartingElement: d, group: 'enterExitLines' }); })
                })
            })
        }
        function updateEnterExit(update)
        {
            const names = ['stopLossLine', 'enterLine', 'enterBufferLine', 'exitBufferLine', 'exitLine', 'moonLine']
            update.each(function (d)
            {
                const yPositions = [d.stopLossPrice, d.enterPrice, d.enterBufferPrice, d.exitBufferPrice, d.exitPrice, d.moonPrice].map((price) => createPriceScale({ priceToPixel: price }))
                update.select('.stopLossShading').attr('x', 0).attr('y', yPositions[1]).attr('width', candleDimensions.width).attr('height', yPositions[0] - yPositions[1])
                update.select('.enterBufferShading').attr('x', 0).attr('y', yPositions[2]).attr('width', candleDimensions.width).attr('height', yPositions[1] - yPositions[2])
                update.select('.exitBufferShading').attr('x', 0).attr('y', yPositions[4]).attr('width', candleDimensions.width).attr('height', yPositions[3] - yPositions[4])
                update.select('.moonShading').attr('x', 0).attr('y', yPositions[5]).attr('width', candleDimensions.width).attr('height', yPositions[4] - yPositions[5])

                let twoPercentAboveEnter = createPriceScale({ priceToPixel: (d.enterPrice + (d.enterPrice * 0.02)) })
                update.select(`.twoPercentLine`).attr('y1', twoPercentAboveEnter).attr('y2', twoPercentAboveEnter)

                yPositions.map((position, index) =>
                {
                    update.select(`.${names[index]}`).attr('y1', position).attr('y2', position)
                })
            })
        }

        //remove the charting svg for enter exit plans 

    }, [ticker, chartId, EnterExitPlan, candleData, candleDimensions, chartZoomState?.x, chartZoomState?.y,])

    //plot macro key levels
    useEffect(() =>
    {
        stockCandleSVG.select('.keyLevels').selectAll('line').remove()
        stockCandleSVG.select('.keyLevels').selectAll('text').remove()
        stockCandleSVG.select('.keyLevels').selectAll('rect').remove()

        if (preDimensionsAndCandleCheck() || !KeyLevels) return

        const textOffSetFromRight = 120
        if (KeyLevels.dailyEM && timeFrame.intraDay)
        {
            let iVolUpperDailyEm = createPriceScale({ priceToPixel: KeyLevels.dailyEM.iVolDailyEMUpper })
            let dailyUpperEm = createPriceScale({ priceToPixel: KeyLevels.dailyEM.dailyEMUpper })

            let dailyLowerEm = createPriceScale({ priceToPixel: KeyLevels.dailyEM.dailyEMLower })
            let iVolLowerDailyEm = createPriceScale({ priceToPixel: KeyLevels.dailyEM.iVolDailyEMLower })
            let start = -2000

            stockCandleSVG.select('.keyLevels').selectAll('.lowerDailyEM').data([{ iVolLowerDailyEm, dailyLowerEm }]).join(
                enter =>
                {
                    enter.append('rect').attr('class', 'lowerDailyEM').attr('x', (d, i) => start).attr('width', 5000).attr('fill', 'green').attr('opacity', 0.25)
                        .attr('y', (d) => dailyLowerEm).attr('height', d => iVolLowerDailyEm - dailyLowerEm)

                    enter.append('rect').attr('class', 'upperDailyEM').attr('x', (d, i) => start).attr('width', 5000).attr('fill', 'red').attr('opacity', 0.25)
                        .attr('y', (d) => iVolUpperDailyEm).attr('height', d => dailyUpperEm - iVolUpperDailyEm)

                    enter.append('text').attr('class', 'keyLevelSubText').text(`iVol Upper Daily - ${KeyLevels.dailyEM.iVolDailyEMUpper}`).attr('x', candleDimensions.width - textOffSetFromRight).attr('y', iVolUpperDailyEm)
                    enter.append('text').attr('class', 'keyLevelSubText').text(`Upper Daily - ${KeyLevels.dailyEM.dailyEMUpper}`).attr('x', candleDimensions.width - textOffSetFromRight).attr('y', dailyUpperEm + 10)

                    enter.append('text').attr('class', 'keyLevelSubText').text(`Lower Daily - ${KeyLevels.dailyEM.dailyEMLower}`).attr('x', candleDimensions.width - textOffSetFromRight).attr('y', dailyLowerEm)
                    enter.append('text').attr('class', 'keyLevelSubText').text(`iVol Lower Daily - ${KeyLevels.dailyEM.iVolDailyEMLower}`).attr('x', candleDimensions.width - textOffSetFromRight).attr('y', iVolLowerDailyEm + 10)
                }
            )

        }

        if (KeyLevels.weeklyEM && timeFrame.intraDay)
        {
            let dollarWeeklyUpper = KeyLevels.weeklyEM.weeklyClose + KeyLevels.weeklyEM.sigma
            let dollarWeeklyLower = KeyLevels.weeklyEM.weeklyClose - KeyLevels.weeklyEM.sigma

            let weeklyUpper = createPriceScale({ priceToPixel: dollarWeeklyUpper })
            stockCandleSVG.select('.keyLevels').append('line').attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', weeklyUpper).attr('y2', weeklyUpper).attr('stroke', 'orange').attr('stroke-width', '4px')
            stockCandleSVG.select('.keyLevels').append('text').attr('class', 'keyLevelSubText').text(`Upper Weekly - ${dollarWeeklyUpper.toFixed(2)}`).attr("x", candleDimensions.width - textOffSetFromRight).attr("y", weeklyUpper)

            let weeklyLower = createPriceScale({ priceToPixel: dollarWeeklyLower })
            stockCandleSVG.select('.keyLevels').append('line').attr('stroke', 'orange').attr('stroke-width', '4px').attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', weeklyLower).attr('y2', weeklyLower)
            stockCandleSVG.select('.keyLevels').append('text').attr('class', 'keyLevelSubText').text(`Lower Weekly - ${dollarWeeklyLower.toFixed(2)}`).attr("x", candleDimensions.width - textOffSetFromRight).attr("y", weeklyLower + 10)

        } else if (KeyLevels.weeklyEM)
        {
            stockCandleSVG.select('.keyLevels').selectAll('.weeklyEMMoves').data(KeyLevels.weeklyEM.previousWeeklyEM).join(enter =>
            {
                enter.each(function (d, i)
                {
                    let weekStart = d.startDate
                    let startPixel = createDateScale({ dateToPixel: weekStart })
                    let endPixel = createDateScale({ dateToPixel: addDays(weekStart, 5) })

                    let weeklyUpper = createPriceScale({ priceToPixel: d.upper })
                    stockCandleSVG.select('.keyLevels').append('line').attr('x1', startPixel).attr('x2', endPixel).attr('y1', weeklyUpper).attr('y2', weeklyUpper).attr('stroke', 'orange').attr('stroke-width', '2px')
                    let weeklyLower = createPriceScale({ priceToPixel: d.lower })
                    stockCandleSVG.select('.keyLevels').append('line').attr('x1', startPixel).attr('x2', endPixel).attr('y1', weeklyLower).attr('y2', weeklyLower).attr('stroke', 'orange').attr('stroke-width', '2px')
                })
            })
        }

        if (KeyLevels.monthlyEM && !timeFrame.intraDay)
        {
            let startPixel = createDateScale({ dateToPixel: startOfMonth(new Date()) })
            let endPixel = createDateScale({ dateToPixel: endOfMonth(new Date()) })
            let monthlyUpper = createPriceScale({ priceToPixel: KeyLevels.monthlyEM.monthUpperEM })
            let monthlyLower = createPriceScale({ priceToPixel: KeyLevels.monthlyEM.monthLowerEM })
            stockCandleSVG.select('.keyLevels').append('line').attr('stroke', 'red').attr('stroke-width', '2px').attr('x1', startPixel).attr('x2', endPixel).attr('y1', monthlyUpper).attr('y2', monthlyUpper)
            stockCandleSVG.select('.keyLevels').append('line').attr('stroke', 'red').attr('stroke-width', '2px').attr('x1', startPixel).attr('x2', endPixel).attr('y1', monthlyLower).attr('y2', monthlyLower)

            stockCandleSVG.select('.keyLevels').selectAll('.previousWeeklyEMMoves').data(KeyLevels.monthlyEM.previousMonthlyEM).join(enter =>
            {
                enter.each(function (d, i)
                {
                    let startPixel = createDateScale({ dateToPixel: startOfMonth(d.startDate) })
                    let endPixel = createDateScale({ dateToPixel: endOfMonth(d.startDate) })
                    let monthlyUpper = createPriceScale({ priceToPixel: d.upper })
                    let monthlyLower = createPriceScale({ priceToPixel: d.lower })
                    stockCandleSVG.select('.keyLevels').append('line').attr('stroke', 'red').attr('stroke-width', '2px').attr('x1', startPixel).attr('x2', endPixel).attr('y1', monthlyUpper).attr('y2', monthlyUpper)
                    stockCandleSVG.select('.keyLevels').append('line').attr('stroke', 'red').attr('stroke-width', '2px').attr('x1', startPixel).attr('x2', endPixel).attr('y1', monthlyLower).attr('y2', monthlyLower)
                })
            })
        }

        if (KeyLevels.quarterlyEM && !timeFrame.intraDay)
        {
            let startPixel = createDateScale({ dateToPixel: startOfQuarter(new Date()) })
            let endPixel = createDateScale({ dateToPixel: endOfQuarter(new Date()) })
            let quarterlyUpper = createPriceScale({ priceToPixel: KeyLevels.quarterlyEM.quarterlyUpper })
            let quarterlyLower = createPriceScale({ priceToPixel: KeyLevels.quarterlyEM.quarterlyLower })

            stockCandleSVG.select('.keyLevels').append('line').attr('stroke', 'blue').attr('stroke-width', '2px').attr('x1', startPixel).attr('x2', endPixel).attr('y1', quarterlyLower).attr('y2', quarterlyLower)
            stockCandleSVG.select('.keyLevels').append('line').attr('stroke', 'blue').attr('stroke-width', '2px').attr('x1', startPixel).attr('x2', endPixel).attr('y1', quarterlyUpper).attr('y2', quarterlyUpper)

            stockCandleSVG.select('.keyLevels').selectAll('.previousQuarterlyEMMoves').data(KeyLevels.quarterlyEM.previousQuarterlyEM).join(enter =>
            {
                enter.each(function (d, i)
                {
                    let startPixel = createDateScale({ dateToPixel: startOfQuarter(d.startDate) })
                    let endPixel = createDateScale({ dateToPixel: endOfQuarter(d.startDate) })
                    let quarterlyUpper = createPriceScale({ priceToPixel: d.upper })
                    let quarterlyLower = createPriceScale({ priceToPixel: d.lower })
                    stockCandleSVG.select('.keyLevels').append('line').attr('stroke', 'blue').attr('stroke-width', '2px').attr('x1', startPixel).attr('x2', endPixel).attr('y1', quarterlyUpper).attr('y2', quarterlyUpper)
                    stockCandleSVG.select('.keyLevels').append('line').attr('stroke', 'blue').attr('stroke-width', '2px').attr('x1', startPixel).attr('x2', endPixel).attr('y1', quarterlyLower).attr('y2', quarterlyLower)
                })
            })
        }

        if (KeyLevels.gammaFlip)
        {
            let gammaPrice = createPriceScale({ priceToPixel: KeyLevels.gammaFlip })
            stockCandleSVG.select('.keyLevels').append('line')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('y1', gammaPrice).attr('y2', gammaPrice)
                .attr('stroke', 'yellow')
                .attr('stroke-width', '1px')
                .attr('stroke-dasharray', '5 5')
            stockCandleSVG.select('.keyLevels').append('text').attr('class', 'keyLevelSubText').text('GammaFlip').attr("x", candleDimensions.width - 75).attr("y", gammaPrice)
        }

        if (KeyLevels.standardDeviation && timeFrame.intraDay)
        {
            let oneSigmaUpper = createPriceScale({ priceToPixel: (KeyLevels.standardDeviation.close + KeyLevels.standardDeviation.sigma) })
            let oneSigmaLower = createPriceScale({ priceToPixel: (KeyLevels.standardDeviation.close - KeyLevels.standardDeviation.sigma) })
            let twoSigmaUpper = createPriceScale({ priceToPixel: (KeyLevels.standardDeviation.close + (2 * KeyLevels.standardDeviation.sigma)) })
            let twoSigmaLower = createPriceScale({ priceToPixel: (KeyLevels.standardDeviation.close - (2 * KeyLevels.standardDeviation.sigma)) })
            let close = createPriceScale({ priceToPixel: (KeyLevels.standardDeviation.close) })

            stockCandleSVG.select('.keyLevels').append('line').attr('x1', 0).attr('x2', candleDimensions.width).attr('stroke', 'black').attr('stroke-width', '1px').attr('y1', close).attr('y2', close)

            stockCandleSVG.select('.keyLevels').append('line').attr('x1', 0).attr('x2', candleDimensions.width).attr('stroke', 'gray').attr('stroke-width', '1px').attr('y1', oneSigmaLower).attr('y2', oneSigmaLower)
            stockCandleSVG.select('.keyLevels').append('text').attr('class', 'keyLevelSubText').text('1SD').attr("x", candleDimensions.width - textOffSetFromRight / 2).attr("y", oneSigmaLower)

            stockCandleSVG.select('.keyLevels').append('line').attr('x1', 0).attr('x2', candleDimensions.width).attr('stroke', 'gray').attr('stroke-width', '1px').attr('y1', oneSigmaUpper).attr('y2', oneSigmaUpper)
            stockCandleSVG.select('.keyLevels').append('text').attr('class', 'keyLevelSubText').text('1SD').attr("x", candleDimensions.width - textOffSetFromRight / 2).attr("y", oneSigmaUpper)

            stockCandleSVG.select('.keyLevels').append('line').attr('x1', 0).attr('x2', candleDimensions.width).attr('stroke', 'gray').attr('stroke-width', '1px').attr('y1', twoSigmaLower).attr('y2', twoSigmaLower)
            stockCandleSVG.select('.keyLevels').append('text').attr('class', 'keyLevelSubText').text('2SD').attr("x", candleDimensions.width - textOffSetFromRight / 2).attr("y", twoSigmaLower)

            stockCandleSVG.select('.keyLevels').append('line').attr('x1', 0).attr('x2', candleDimensions.width).attr('stroke', 'gray').attr('stroke-width', '1px').attr('y1', twoSigmaUpper).attr('y2', twoSigmaUpper)
            stockCandleSVG.select('.keyLevels').append('text').attr('class', 'keyLevelSubText').text('1SD').attr("x", candleDimensions.width - textOffSetFromRight / 2).attr("y", twoSigmaUpper)
        }

        if (KeyLevels.oneDayToExpire && timeFrame.intraDay)
        {
            stockCandleSVG.select('.keyLevels').selectAll('.DTE').data(KeyLevels.oneDayToExpire).join(enter =>
            {
                enter.each(function (d, i)
                {
                    let dtePixel = createPriceScale({ priceToPixel: d })
                    enter.append('line').attr('x1', 0).attr('x2', candleDimensions.width).attr('stroke', 'purple').attr('stroke-width', '1px').attr('stroke-dasharray', '5 2 5').attr('y1', dtePixel).attr('y2', dtePixel)
                })
            })
        }

    }, [ticker, KeyLevels, candleData, candleDimensions, chartZoomState?.x, chartZoomState?.y,])









    //configure svg cross hair, context menu, and tool interactions
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !isInteractive) return
        initializeMouseCrossHairBehavior()
        if (!stockCandleSVG.on('contextmenu')) { stockCandleSVG.on('contextmenu', (e) => { e.preventDefault(); setShowContextMenu({ display: true, style: { left: `${e.offsetX}px`, top: `${e.offsetY}px` } }) }) }

        let toolingFunction = toolFunctionExports[ChartingTools.findIndex(t => t.tool === currentTool)]
        stockCandleSVG.on('click', (e) => toolingFunction(e, setEnableZoom, candleSVG.current, pixelSet, setCaptureComplete, createDateScale, createPriceScale))
    }, [currentTool, candleDimensions, candleData, chartZoomState?.x, chartZoomState?.y,])

    //update charting state post trace
    useEffect(() =>
    {
        if (!captureComplete || preDimensionsAndCandleCheck() || !isInteractive) return

        let completeCapture = {}
        let pixelCapture = pixelSet.current

        if (currentTool === 'Enter Exit')
        {
            completeCapture.dateP1 = createDateScale({ pixelToDate: pixelCapture.X1 })

            completeCapture.enterPrice = createPriceScale({ pixelToPrice: pixelCapture.Y1 })
            completeCapture.enterBufferPrice = createPriceScale({ pixelToPrice: pixelCapture.Y2 })
            completeCapture.stopLossPrice = createPriceScale({ pixelToPrice: pixelCapture.Y3 })
            completeCapture.exitPrice = createPriceScale({ pixelToPrice: pixelCapture.Y4 })
            completeCapture.exitBufferPrice = createPriceScale({ pixelToPrice: pixelCapture.Y5 })
            completeCapture.moonPrice = createPriceScale({ pixelToPrice: pixelCapture.Y6 })

            completeCapture.percents = [pixelCapture.P1, pixelCapture.P2, pixelCapture.P3, pixelCapture.P4, pixelCapture.P5]

            if (EnterExitPlan)
            {
                dispatch(defineEnterExitPlan({ ticker, enterExitPlan: completeCapture }))
                attemptToUpdateEnterExit()
            } else { dispatch(addEnterExitToCharting({ ticker, enterExit: completeCapture })) }

        } else
        {
            if (pixelCapture?.X1) completeCapture.dateP1 = new Date(createDateScale({ pixelToDate: pixelCapture.X1 })).toISOString()
            if (pixelCapture?.X2) completeCapture.dateP2 = new Date(createDateScale({ pixelToDate: pixelCapture.X2 })).toISOString()
            Object.keys(pixelSet.current).filter(t => t.includes('Y')).map((pixelForPrice, i) => { completeCapture[`priceP${i + 1}`] = createPriceScale({ pixelToPrice: pixelCapture[pixelForPrice] }) })

            switch (currentTool)
            {
                case ChartingTools[1].tool: dispatch(addLine({ line: completeCapture, ticker })); break; //line tool

                case ChartingTools[4].tool: dispatch(addVolumeNode({ completeCapture, ticker, isHighVolNode: false })); break; //low volume node
                case ChartingTools[5].tool: dispatch(addVolumeNode({ completeCapture, ticker, isHighVolNode: true })); break; //high volume node

                //Add other charting tool dispatches to update different charting

            }
        }

        resetTemp()

    }, [currentTool, captureComplete])

    //toggle edit visual aids
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !isInteractive) return
        stockCandleSVG.selectAll('.edit').attr('visibility', 'hidden');

        switch (editMode)
        {
            case ChartingToolEdits[0].editTool: stockCandleSVG.select('.enterExits').selectAll('.edit').attr('visibility', 'visible').call(dragEnterExitBehavior); break;
        }


    }, [editMode])

    //charting visibility
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !isInteractive) return

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
    }, [charting, EnterExitPlan, chartingVisibility])

    //keyboard event listeners
    useEffect(() =>
    {
        if (!captureComplete) { document.addEventListener('keydown', (e) => { resetTempBeforeCompletion(e); deleteSelectedEditChartElement(e) }) }
        else { document.removeEventListener('keydown', resetTempBeforeCompletion) }

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
        if (preDimensionsAndCandleCheck() || !isZoomAble) return
        const zoomBehavior = zoom().on('zoom', () =>
        {
            if (enableZoom)
            {
                const zoomState = zoomTransform(stockCandleSVG.node())
                dispatch(setXZoomState({ uuid, zoom: { x: zoomState.x, y: zoomState.y, k: zoomState.k } }))
            }
            return null
        })
        stockCandleSVG.call(zoomBehavior)
    }, [candleData, enableZoom, candleDimensions, timeFrame])

    //zoomYBehavior
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !isZoomAble) return
        const zoomBehavior = zoom().on('zoom', () =>
        {
            const zoomState = zoomTransform(priceScaleSVG.node())
            dispatch(setYZoomState({ uuid, zoom: { x: zoomState.x, y: zoomState.y, k: zoomState.k } }))
        })
        priceScaleSVG.call(zoomBehavior)
    }, [candleData, priceDimensions, timeFrame])


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


    const dragBehavior = drag().on('start', dragWholeLineStarted).on('drag', draggedWholeLine).on('end', dragWholeLineEnded)
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


    const dragEnterExitBehavior = drag().on('start', dragEnterExitLineVertStart).on('drag', dragEnterExitVertLine).on('end', dragEnterExitVertLineEnd)
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
    }
    function dragEnterExitVertLineEnd(e, d)
    {
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

        //update the percentages
        if (EnterExitPlan)
        {
            dispatch(defineEnterExitPlan({ enterExitPlan: update, ticker }))
            attemptToUpdateEnterExit()
        } else
        {
            dispatch(updateEnterExitToCharting({ updatedEnterExit: update, ticker }))
        }

    }

    return (
        <div className='SVGGraphWrapper'>
            {showContextMenu.display && <ChartContextMenuContainer showContextMenu={showContextMenu} setShowContextMenu={setShowContextMenu} timeFrame={timeFrame} setTimeFrame={setTimeFrame} />}

            <div ref={priceSVGWrapper} className='priceSVGWrapper'>
                <svg ref={priceSVG}>
                    <g className='y-axis' />
                </svg>
            </div>

            <div ref={candleSVGWrapper} className='dateSVGWrapper'>
                <svg ref={candleSVG}>
                    <defs>
                        <linearGradient id="fadeLowVolume" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="blue" stop-opacity="0" />
                            <stop offset="75%" stop-color="blue" stop-opacity="1" />
                            <stop offset="100%" stop-color="blue" stop-opacity="1" />
                        </linearGradient>
                        <linearGradient id="fadeHighVolume" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="green" stop-opacity="0" />
                            <stop offset="75%" stop-color="green" stop-opacity="1" />
                            <stop offset="100%" stop-color="green" stop-opacity="1" />
                        </linearGradient>
                    </defs>
                    <g className='x-axis' />
                    <g className='visualDateBreaks' />
                    <g className='initialTrack' />
                    <g className='enterExits' />
                    <g className='tickerVal' />
                    <g className='lastCandleUpdate' />
                    <g className='crossHairs' >
                        <line className='crossY' strokeWidth='0.5px' stroke='black'></line>
                        <line className='crossX' strokeWidth='0.5px' stroke='black'></line>
                        <text className='priceY'></text>
                    </g>
                    <g className='temp' />
                    <g className='emaLines' />
                    <path className='vwap' />
                    <g className='volumeProfile' />
                    <g className='freeLines' />
                    <g className='linesH' />
                    <g className='trendLines' />
                    <g className='wedges' />
                    <g className='lowVolumeNodes' />
                    <g className='highVolumeNodes' />
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