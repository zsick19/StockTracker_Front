import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addEnterExitToCharting, addLine, addVolumeNode, makeSelectChartingByTicker, removeChartingElement, updateEnterExitToCharting, updateLine } from '../../features/Charting/chartingElements'
import { useResizeObserver } from '../../hooks/useResizeObserver'
import { scaleDiscontinuous, discontinuityRange, discontinuitySkipUtcWeekends } from '@d3fc/d3fc-discontinuous-scale'
import { addDays, isToday, subMonths, addYears, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, eachDayOfInterval, getDay } from 'date-fns'
import { select, drag, zoom, zoomTransform, axisBottom, axisLeft, scaleTime, min, max, line, timeDay, scaleLinear, timeMonths, zoomIdentity, curveLinear, curveBasis } from 'd3'
import { pixelBuffer } from './GraphChartConstants'
import { makeSelectKeyLevelsByTicker } from '../../features/KeyLevels/KeyLevelGraphElements'
import { defineEnterExitPlan, makeSelectEnterExitByTicker } from '../../features/EnterExitPlans/EnterExitGraphElement'
import { selectCurrentTool } from '../../features/Charting/ChartingTool'
import { makeSelectGraphVisibilityByUUID } from '../../features/Charting/ChartingVisibility'
import { toolFunctionExports } from '../../Utilities/graphChartingFunctions'
import ChartContextMenuContainer from './contextMenus/ChartContextMenuContainer'
import { ChartingToolEdits, ChartingTools } from '../../Utilities/ChartingTools'
import { allPossibleClassNames, defaultChartingStyles, lineGroupClassName } from '../../Utilities/GraphStyles'
import { lineHover, lineNoHover } from '../../Utilities/chartingHoverFunctions'
import { useUpdateEnterExitPlanMutation } from '../../features/EnterExitPlans/EnterExitApiSlice'
import { selectChartEditMode } from '../../features/Charting/EditChartSelection'
import { generateTradingHours, getBreaksBetweenDates, provideStartAndEndDatesForDateScale } from '../../Utilities/TimeFrames'
import { makeSelectZoomStateByUUID, setXZoomState, setYZoomState } from '../../features/Charting/GraphHoverZoomElement'
import { calculateEMADataPoints, calculateVolumeProfile, calculateVWAP } from '../../Utilities/technicalIndicatorFunctions'
import { makeSelectGraphStudyByUUID } from '../../features/Charting/GraphStudiesVisualElement'
import { setGraphToSubGraphCrossHair, setNoCurrentCrossHair } from '../../features/Charting/GraphToSubGraphCrossHairElement'
import './chartStyles.css'
import { makeSelectGraphHoursByUUID } from '../../features/Charting/GraphMarketHourElement'

function ChartGraph({ ticker, candleData, chartId, mostRecentPrice, setChartInfoDisplay,
    timeFrame, setTimeFrame, isLivePrice, isInteractive, isZoomAble, initialTracking,
    uuid, lastCandleData, candlesToKeepSinceLastQuery, showEMAs })
{


    const dispatch = useDispatch()

    const [updateEnterExitPlan] = useUpdateEnterExitPlanMutation()
    async function attemptToUpdateEnterExit() { try { await updateEnterExitPlan({ ticker, chartId }) } catch (error) { console.log(error) } }

    //redux charting data selectors
    const selectKeyLevelMemo = useMemo(makeSelectKeyLevelsByTicker, [ticker])
    const KeyLevels = useSelector((state) => selectKeyLevelMemo(state, ticker))
    const selectedEnterExitMemo = useMemo(makeSelectEnterExitByTicker, [])
    const EnterExitPlan = useSelector(state => selectedEnterExitMemo(state, ticker))
    const selectedChartingMemo = useMemo(makeSelectChartingByTicker, [])
    const charting = useSelector(state => selectedChartingMemo(state, ticker))



    const selectedStudyVisualStateMemo = useMemo(makeSelectGraphStudyByUUID, [])
    const studyVisualController = useSelector((state) => selectedStudyVisualStateMemo(state, uuid))

    const selectDisplayMarketHoursMemo = useMemo(makeSelectGraphHoursByUUID, [])
    const displayMarketHours = useSelector((state) => selectDisplayMarketHoursMemo(state, uuid))

    const editMode = useSelector(selectChartEditMode)





    //redux graph functioning selectors
    const currentTool = useSelector(selectCurrentTool)

    const selectGraphingVisibilityMemo = useMemo(makeSelectGraphVisibilityByUUID, [])
    const graphElementVisibility = useSelector((state) => selectGraphingVisibilityMemo(state, uuid))


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
    const stockCandleSVG = select(candleSVG.current)
    const priceScaleSVG = select(priceSVG.current)


    //chart zoom states    
    const selectedChartZoomStateMemo = useMemo(makeSelectZoomStateByUUID, [])
    const chartZoomState = useSelector(state => selectedChartZoomStateMemo(state, uuid))
    const [enableZoom, setEnableZoom] = useState(true)


    //chart scale creation
    const minPrice = useMemo(() =>
    {
        if (ticker === 'SPY')
        {
            if (timeFrame.unitOfIncrement === 'D' && KeyLevels?.quarterlyEM?.quarterlyLower) { return KeyLevels.quarterlyEM.quarterlyLower }
            else if (timeFrame.unitOfIncrement === 'M' && KeyLevels?.weeklyEM?.previousWeeklyEM) return KeyLevels.weeklyEM.previousWeeklyEM.at(-1).lower
        }
        else return min(candleData, d => d.LowPrice)
    }, [candleData, KeyLevels?.monthlyEM, timeFrame.unitOfIncrement])
    const maxPrice = useMemo(() =>
    {
        if (ticker === 'SPY')
        {
            if (timeFrame.unitOfIncrement === 'D' && KeyLevels?.quarterlyEM?.quarterlyUpper) { return KeyLevels.quarterlyEM.quarterlyUpper }
            else if (timeFrame.unitOfIncrement === 'M' && KeyLevels?.weeklyEM?.previousWeeklyEM) return KeyLevels.weeklyEM.previousWeeklyEM.at(-1).upper
        }
        else return max(candleData, d => d.HighPrice)
    }, [candleData, KeyLevels?.monthlyEM, timeFrame.unitOfIncrement])
    const minVol = useMemo(() => min(candleData, d => d.Volume), [candleData])
    const maxVol = useMemo(() => max(candleData, d => d.Volume), [candleData])


    //indicator line data
    const vwapData = useMemo(() =>
    {
        if (studyVisualController?.ema || showEMAs) return calculateVWAP(candleData)
        else return undefined
    }, [showEMAs, candleData])
    const VWAPLine = line().x(d => createDateScale({ dateToPixel: d.Timestamp })).y(d => createPriceScale({ priceToPixel: d.vwap })).curve(curveBasis)

    const ema9Values = useMemo(() => calculateEMADataPoints(candleData, 9), [candleData])
    const ema50Values = useMemo(() => calculateEMADataPoints(candleData, 50), [candleData])
    const ema200Values = useMemo(() => calculateEMADataPoints(candleData, 200), [candleData])
    const emaLine = line().x(d => createDateScale({ dateToPixel: d.date })).y(d => createPriceScale({ priceToPixel: d.value })).curve(curveLinear)
    //    const vpData = useMemo(() => calculateVolumeProfile(candleData), [])



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
    const excludedPeriods = useMemo(() => { if (timeFrame.intraDay) return generateTradingHours(timeFrame, displayMarketHours?.showOnlyIntraDay) }, [timeFrame, displayMarketHours?.showOnlyIntraDay])





    const createDateScale = useCallback(({ dateToPixel = undefined, pixelToDate = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return
        const startEndDate = provideStartAndEndDatesForDateScale(timeFrame, displayMarketHours?.focusDates)

        let xDateScale = null
        if (timeFrame.intraDay)
        {
            xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuityRange(...excludedPeriods))
                .domain([startEndDate.startDate, startEndDate.futureForwardEndDate]).range([0, candleDimensions.width])
        }
        else
        {
            xDateScale = scaleDiscontinuous(scaleTime()).discontinuityProvider(discontinuitySkipUtcWeekends())
                .domain([startEndDate.startDate, startEndDate.futureForwardEndDate]).range([0, candleDimensions.width])
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


    }, [candleData, excludedPeriods, displayMarketHours, chartZoomState?.x, candleDimensions, timeFrame])

    const createPriceScale = useCallback(({ priceToPixel = undefined, pixelToPrice = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return
        const yScale = scaleLinear()
            .domain([minPrice - pixelBuffer.yPriceBuffer, maxPrice + pixelBuffer.yPriceBuffer])
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

    }, [candleData, KeyLevels?.monthlyEM, chartZoomState?.y, priceDimensions])

    const createVolumeScale = useCallback(({ volumeToPixel = undefined, pixelToVolume = undefined } = {}) =>
    {
        if (preDimensionsAndCandleCheck()) return

        const yScale = scaleLinear().domain([minVol, maxVol]).range([candleDimensions.height - pixelBuffer.yDirectionPixelBuffer, candleDimensions.height * .75])

        if (pixelToVolume !== undefined) return Math.round(yScale.invert(pixelToVolume) * 100) / 100
        else if (volumeToPixel !== undefined) return yScale(volumeToPixel)
        else return yScale
    }, [candleData, candleDimensions])



    //scaleRefs for user charting drag functionality
    const yScaleRef = useRef()
    yScaleRef.current = createPriceScale
    const xScaleRef = useRef()
    xScaleRef.current = createDateScale
    const tickerRef = useRef()
    tickerRef.current = ticker




    //plot stock candles and any initial tracking info
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        let xAxis
        const yAxis = axisLeft(createPriceScale())

        if (timeFrame.intraDay && timeFrame.duration > 3) { xAxis = axisBottom(createDateScale()).tickValues(timeDay.range(subDays(new Date(), 10), new Date())) }
        else if (timeFrame.intraDay && timeFrame.duration <= 3) { xAxis = axisBottom(createDateScale()) }
        else { xAxis = axisBottom(createDateScale()).tickValues(timeMonths(subMonths(new Date(), 12), new Date())) }

        priceScaleSVG.select('.y-axis').style('transform', `translateX(${priceDimensions.width - 1}px)`).call(yAxis)
        try { stockCandleSVG.select('.x-axis').style('transform', `translateY(${candleDimensions.height - pixelBuffer.yDirectionPixelBuffer}px)`).call(xAxis) }
        catch (error) { console.log(error) }

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
        let trackingLines = stockCandleSVG.select('.initialTrack')

        // if (initialTracking)
        // {
        //     let pixelPrice = createPriceScale({ priceToPixel: initialTracking.price })
        //     let pixelDate = createDateScale({ dateToPixel: initialTracking.date })

        //     trackingLines.append('line').attr('stroke', 'green').attr('stroke-width', '0.5px').attr('stroke-dasharray', '5 2 5').attr('opacity', 0.75)
        //         .attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', pixelPrice).attr('y2', pixelPrice)
        //     trackingLines.append('line').attr('stroke', 'green').attr('stroke-width', '3px').attr('stroke-dasharray', '5 2 5').attr('opacity', 0.75)
        //         .attr('x1', pixelDate).attr('x2', pixelDate).attr('y1', 0).attr('y2', candleDimensions.height)
        // }

        if (EnterExitPlan?.tradeEnterDate)
        {
            let pixelDate = createDateScale({ dateToPixel: EnterExitPlan.tradeEnterDate })
            let pixelPrice = createPriceScale({ priceToPixel: EnterExitPlan.enterPrice })

            trackingLines.append('line').attr('stroke', 'green').attr('stroke-width', '3px').attr('stroke-dasharray', '5 2  5').attr('opacity', 0.75)
                .attr('x1', pixelDate).attr('x2', pixelDate).attr('y1', 0).attr('y2', candleDimensions.height)

            trackingLines.append('line').attr('stroke', 'green').attr('stroke-width', '3px').attr('stroke-dasharray', '5 2 5').attr('opacity', 0.75)
                .attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', pixelPrice).attr('y2', pixelPrice)
        }

        if (EnterExitPlan?.dateCreated)
        {
            let pixelDate = createDateScale({ dateToPixel: EnterExitPlan.dateCreated })
            let pastPixelSize = EnterExitPlan?.tradeEnterDate ? '1px' : '3px'
            trackingLines.append('line').attr('stroke', 'blue').attr('stroke-width', pastPixelSize).attr('stroke-dasharray', '5 2 5').attr('opacity', 0.75)
                .attr('x1', pixelDate).attr('x2', pixelDate).attr('y1', 0).attr('y2', candleDimensions.height)
        }

        if (EnterExitPlan?.initialTrackingPrice)
        {
            let pixelPrice = createPriceScale({ priceToPixel: EnterExitPlan.initialTrackingPrice })
            let pastPixelSize = EnterExitPlan?.tradeEnterDate ? '1px' : '3px'
            trackingLines.append('line').attr('stroke', 'blue').attr('stroke-width', pastPixelSize).attr('stroke-dasharray', '5 2 5').attr('opacity', 0.75)
                .attr('x1', 0).attr('x2', candleDimensions.width).attr('y1', pixelPrice).attr('y2', pixelPrice)

        }

    }, [candleData, minPrice, maxPrice, excludedPeriods, displayMarketHours, EnterExitPlan, candleDimensions, chartZoomState?.x, chartZoomState?.y, timeFrame])

    //plot EMA and VWAP lines
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        if (studyVisualController?.ema || showEMAs)
        {
            const ema = stockCandleSVG.select('.emaLines')
            ema.selectAll('.ema9').data([ema9Values], d => d.Timestamp).join(enter =>
                enter.append('path').attr('class', 'periodLines ema9').attr('stroke', 'blue').attr('fill', 'none').attr('stroke-width', '1.5px').attr('d', d => emaLine(d)),
                update => update.attr('d', d => emaLine(d)))

            ema.selectAll('.ema50').data([ema50Values], d => d.Timestamp).join(enter =>
                enter.append('path').attr('class', 'periodLines ema50').attr('stroke', 'purple').attr('fill', 'none').attr('stroke-width', '1.5px').attr('d', d => emaLine(d)),
                update => update.attr('d', d => emaLine(d))
            )

            ema.selectAll('.ema200').data([ema200Values], d => d.Timestamp).join(enter =>
                enter.append('path').attr('class', 'periodLines ema50').attr('stroke', 'red').attr('fill', 'none').attr('stroke-width', '1.5px').attr('d', d => emaLine(d)),
                update => update.attr('d', d => emaLine(d))
            )
        } else { stockCandleSVG.select('.emaLines').selectAll('.periodLines').remove() }

        if (studyVisualController?.vwap && vwapData)
        {
            stockCandleSVG.select('.vwap').select('.vwapLine').attr('d', VWAPLine(vwapData)).attr('stroke', 'orange').attr('fill', 'none').attr('stroke-width', '1.5px')
        } else
        {
            stockCandleSVG.select('.vwap').selectAll('.vwapLine').remove()
            stockCandleSVG.select('.vwap').append('path').attr('class', 'vwapLine')
        }
    }, [studyVisualController, excludedPeriods, vwapData, displayMarketHours, candleDimensions, chartZoomState?.x, chartZoomState?.y, candleData])



    //draw visual time breaks
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        let dateVisualSelect = stockCandleSVG.select('.visualDateBreaks')
        if (timeFrame.intraDay && !displayMarketHours?.showOnlyIntraDay)
        {
            dateVisualSelect.selectAll('.visualBreak').remove()
            dateVisualSelect.selectAll('.dayBreakLine').remove()
            dateVisualSelect.selectAll('.preMarketVisualBreak').data([...visualBreaksPeriods.preMarket]).join(enter => createMarketOpenVisualBreaks(enter), update => updateMarketOpenVisualBreaks(update))
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
        }
        else if (timeFrame.intraDay && displayMarketHours.showOnlyIntraDay)
        {
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
        }
        else if (!timeDay.intraDay)
        {
            dateVisualSelect.selectAll('.dayBreakLine').remove()
            dateVisualSelect.selectAll('.preMarketVisualBreak').remove()
            dateVisualSelect.selectAll('.visualBreak').remove()
            let pixelDates = visualBreaksPeriods.months.map((d) => createDateScale({ dateToPixel: d }))
            dateVisualSelect.selectAll('.visualBreak').data(visualBreaksPeriods.months).join(enter => createVisualBreaks(enter))
            function createVisualBreaks(enter)
            {
                enter.append('rect').attr('class', (d, i) => { return i % 2 !== 0 ? 'monthOdd visualBreak' : 'monthEven visualBreak' })
                    .attr('x', (d, i) => createDateScale({ dateToPixel: d })).attr('y', -pixelBuffer.yDirectionPixelBuffer)
                    .attr('width', (d, i) => { return pixelDates[i + 1] - createDateScale({ dateToPixel: d }) })
                    .attr('height', candleDimensions.height)
            }
        }
    }, [candleDimensions, excludedPeriods, displayMarketHours, chartZoomState?.x, chartZoomState?.y, timeFrame])

    //plot previous candle Data and live price
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !lastCandleData) return

        let centerTextOnPriceLinePixel = 4
        let centerRectOnPriceLinePixel = 15
        let priceOnYScale = priceScaleSVG.select('.currentPrice')

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

                priceOnYScale.append('rect').attr('class', 'livePriceRect').attr('x', 0).attr('y', pixelPrice - centerRectOnPriceLinePixel + centerTextOnPriceLinePixel)
                    .attr('width', '49px').attr('height', '20px').attr('fill', 'blue')

                priceOnYScale.append('text').attr('class', 'livePriceText').attr('color', 'white')
                    .text(`$${d.ClosePrice.toFixed(2)}`).attr("x", 3).attr("y", pixelPrice + centerTextOnPriceLinePixel);
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

                priceOnYScale.select('.livePriceRect').attr('y', pixelPrice - 15 + 4).attr('rx', 7)
                priceOnYScale.select('.livePriceText').text(`$${d.ClosePrice.toFixed(2)}`).attr('y', pixelPrice + centerTextOnPriceLinePixel)
            })

        }
    }, [lastCandleData, excludedPeriods, displayMarketHours, candlesToKeepSinceLastQuery, candleDimensions, chartZoomState?.x, chartZoomState?.y, timeFrame])


    //plot volume bars
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        if (studyVisualController?.volume)
        {

            stockCandleSVG.select('.candleVolumeBars').selectAll('.vol-bar').data(candleData, d => d.Volume)
                .join(enter => generateVolumeBars(enter), update => updateVolumeBars(update))

            function generateVolumeBars(enter)
            {
                enter.each(function (d, i)
                {
                    let volumePixel = createVolumeScale({ volumeToPixel: d.Volume })


                    select(this).append('rect').attr('class', d => `vol-bar`).attr('width', 2)
                        .attr('x', d => createDateScale({ dateToPixel: d.Timestamp }) - 1)
                        .attr('y', volumePixel - pixelBuffer.yDirectionPixelBuffer)
                        .attr('height', d => candleDimensions.height - volumePixel)
                        .attr('fill', d => d.ClosePrice > d.OpenPrice ? 'green' : 'red')
                })
            }
            function updateVolumeBars(update)
            {
                update.each(function (d, i) { select(this).attr('x', d => createDateScale({ dateToPixel: d.Timestamp })) })
            }
        } else
        {
            stockCandleSVG.select('.candleVolumeBars').selectAll('.vol-bar').remove()
        }

    }, [candleData, studyVisualController?.volume, timeFrame, excludedPeriods, displayMarketHours, chartZoomState?.x, candleDimensions])










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

    }, [mostRecentPrice, candleData, displayMarketHours, chartZoomState?.x, chartZoomState?.y, timeFrame])

    const names = ['stopLossLine', 'enterLine', 'enterBufferLine', 'exitBufferLine', 'exitLine', 'moonLine']
    const lineColors = ['green', 'yellow', 'red', 'yellow', 'green', 'black']

    //plot user charting  
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck() || !charting) return

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

                const planArray = [d.stopLossPrice, d.enterPrice, d.enterBufferPrice, d.exitBufferPrice, d.exitPrice, d.moonPrice]
                const yPositions = planArray.map((price) => yScaleRef.current({ priceToPixel: price }))

                lineGroup.append('rect').attr('class', 'stopLossShading').attr('x', 0).attr('y', yPositions[1]).attr('width', candleDimensions.width).attr('height', yPositions[0] - yPositions[1]).attr('fill', 'red').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'enterBufferShading').attr('x', 0).attr('y', yPositions[2]).attr('width', candleDimensions.width).attr('height', yPositions[1] - yPositions[2]).attr('fill', 'yellow').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'exitBufferShading').attr('x', 0).attr('y', yPositions[4]).attr('width', candleDimensions.width).attr('height', yPositions[3] - yPositions[4]).attr('fill', 'green').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'moonShading').attr('x', 0).attr('y', yPositions[5]).attr('width', candleDimensions.width).attr('height', yPositions[4] - yPositions[5]).attr('fill', 'blue').attr('opacity', 0.1)

                yPositions.map((position, index) =>
                {
                    lineGroup.append('line').attr('class', `${names[index]} edit`)
                        .attr('x1', 0).attr('x2', 5000).attr('y1', position).attr('y2', position).attr('stroke', lineColors[index])
                        .attr('stroke-width', 10).attr('visibility', 'hidden').on('mouseover', function (e, d) { setEditChartElement({ chartingElement: d, group: 'enterExitLines' }); })

                    lineGroup.append('text').attr('class', `${names[index]}Text`).attr('x', 100).attr('y', position).text(`$${planArray[index]}`)
                    if (index === 0) { lineGroup.append('text').attr('class', `${names[index]}Percents`).attr('x', 200).attr('y', position).text(`${d.percents[index]}%`) }
                    else if (index > 1) { lineGroup.append('text').attr('class', `${names[index]}Percents`).attr('x', 200).attr('y', position).text(`${d.percents[index - 1]}%`) }
                })
            })
        }
        function updateEnterExit(update)
        {
            update.each(function (d)
            {
                const planArray = [d.stopLossPrice, d.enterPrice, d.enterBufferPrice, d.exitBufferPrice, d.exitPrice, d.moonPrice]
                const yPositions = planArray.map((price) => yScaleRef.current({ priceToPixel: price }))

                update.select('.stopLossShading').attr('x', 0).attr('y', yPositions[1]).attr('width', candleDimensions.width).attr('height', yPositions[0] - yPositions[1])
                update.select('.enterBufferShading').attr('x', 0).attr('y', yPositions[2]).attr('width', candleDimensions.width).attr('height', yPositions[1] - yPositions[2])
                update.select('.exitBufferShading').attr('x', 0).attr('y', yPositions[4]).attr('width', candleDimensions.width).attr('height', yPositions[3] - yPositions[4])
                update.select('.moonShading').attr('x', 0).attr('y', yPositions[5]).attr('width', candleDimensions.width).attr('height', yPositions[4] - yPositions[5])

                yPositions.map((position, index) =>
                {
                    update.select(`.${names[index]}`).attr('y1', position).attr('y2', position)
                    update.select(`.${names[index]}Text`).attr('y', position).text(`$${planArray[index]}`)
                    if (index === 0) { update.select(`.${names[index]}Percents`).attr('y', position).text(`${d.percents[index]}%`) }
                    else if (index > 1) { update.select(`.${names[index]}Percents`).attr('y', position).text(`${d.percents[index - 1]}%`) }
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

    }, [ticker, excludedPeriods, displayMarketHours, chartId, charting, candleData, candleDimensions, chartZoomState?.x, chartZoomState?.y,])


    //plot user EnterExit Plan removing any possible charting enter exit  
    useEffect(() =>
    {
        if (!EnterExitPlan) stockCandleSVG.select('.enterExit').selectAll('.line_group').remove()

        if (preDimensionsAndCandleCheck() || !EnterExitPlan) return
        console.log(EnterExitPlan)
        //enter exit plan creation and update
        // stockCandleSVG.select('.enterExit').select('.twoPercentLine').remove()
        stockCandleSVG.select('.enterExits').selectAll('.line_group').data([EnterExitPlan]).join((enter) => createEnterExit(enter), (update) => updateEnterExit(update))
        function createEnterExit(enter)
        {
            enter.each(function (d)
            {
                var lineGroup = select(this).append('g').attr('class', (d) => isToday(d.dateCreated) ? 'line_group today' : 'line_group previous')

                const planArray = [d.stopLossPrice, d.enterPrice, d.enterBufferPrice, d.exitBufferPrice, d.exitPrice, d.moonPrice]
                const yPositions = planArray.map((price) => yScaleRef.current({ priceToPixel: price }))

                lineGroup.append('rect').attr('class', 'stopLossShading').attr('x', 0).attr('y', yPositions[1]).attr('width', candleDimensions.width).attr('height', yPositions[0] - yPositions[1]).attr('fill', 'red').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'enterBufferShading').attr('x', 0).attr('y', yPositions[2]).attr('width', candleDimensions.width).attr('height', yPositions[1] - yPositions[2]).attr('fill', 'yellow').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'exitBufferShading').attr('x', 0).attr('y', yPositions[4]).attr('width', candleDimensions.width).attr('height', yPositions[3] - yPositions[4]).attr('fill', 'green').attr('opacity', 0.1)
                lineGroup.append('rect').attr('class', 'moonShading').attr('x', 0).attr('y', yPositions[5]).attr('width', candleDimensions.width).attr('height', yPositions[4] - yPositions[5]).attr('fill', 'blue').attr('opacity', 0.1)

                let twoPercentAboveEnter = createPriceScale({ priceToPixel: (d.enterPrice + (d.enterPrice * 0.02)) })
                lineGroup.append('line').attr('class', `twoPercentLine`).attr('x1', 0).attr('x2', 5000).attr('y1', twoPercentAboveEnter).attr('y2', twoPercentAboveEnter).attr('stroke', 'purple').attr('stroke-dasharray', '3 10 3')

                if (d?.percents)
                {

                    yPositions.map((position, index) =>
                    {
                        lineGroup.append('line').attr('class', `${names[index]} edit`).attr('x1', 0).attr('x2', 5000).attr('y1', position).attr('y2', position).attr('stroke', lineColors[index])
                            .attr('stroke-width', 10).attr('visibility', 'hidden').on('mouseover', function (e, d) { setEditChartElement({ chartingElement: d, group: 'enterExitLines' }); })

                        lineGroup.append('text').attr('class', `${names[index]}Text`).attr('x', 100).attr('y', position).text(`$${planArray[index]}`).attr('visibility', 'hidden')
                        if (index === 0) { lineGroup.append('text').attr('class', `${names[index]}Percents`).attr('x', 200).attr('y', position).text(`${d.percents[index]}%`).attr('visibility', 'hidden') }
                        else if (index > 1) { lineGroup.append('text').attr('class', `${names[index]}Percents`).attr('x', 200).attr('y', position).text(`${d.percents[index - 1]}%`).attr('visibility', 'hidden') }
                    })
                }
            })

        }

        function updateEnterExit(update)
        {
            update.each(function (d)
            {
                const planArray = [d.stopLossPrice, d.enterPrice, d.enterBufferPrice, d.exitBufferPrice, d.exitPrice, d.moonPrice]
                const yPositions = planArray.map((price) => createPriceScale({ priceToPixel: price }))
                update.select('.stopLossShading').attr('x', 0).attr('y', yPositions[1]).attr('width', candleDimensions.width).attr('height', yPositions[0] - yPositions[1])
                update.select('.enterBufferShading').attr('x', 0).attr('y', yPositions[2]).attr('width', candleDimensions.width).attr('height', yPositions[1] - yPositions[2])
                update.select('.exitBufferShading').attr('x', 0).attr('y', yPositions[4]).attr('width', candleDimensions.width).attr('height', yPositions[3] - yPositions[4])
                update.select('.moonShading').attr('x', 0).attr('y', yPositions[5]).attr('width', candleDimensions.width).attr('height', yPositions[4] - yPositions[5])

                let twoPercentAboveEnter = createPriceScale({ priceToPixel: (d.enterPrice + (d.enterPrice * 0.02)) })
                update.select(`.twoPercentLine`).attr('y1', twoPercentAboveEnter).attr('y2', twoPercentAboveEnter)

                yPositions.map((position, index) =>
                {
                    update.select(`.${names[index]}`).attr('y1', position).attr('y2', position)
                    update.select(`.${names[index]}Text`).attr('y', position).text(`$${planArray[index]}`)
                    if (index === 0) { update.select(`.${names[index]}Percents`).attr('y', position).text(`${d.percents[index]}%`) }
                    else if (index > 1) { update.select(`.${names[index]}Percents`).attr('y', position).text(`${d.percents[index - 1]}%`) }
                })
            })
        }

        //remove the charting svg for enter exit plans 

    }, [ticker, chartId, charting, EnterExitPlan, candleData, candleDimensions, chartZoomState?.x, chartZoomState?.y,])

    //plot macro key levels
    useEffect(() =>
    {
        stockCandleSVG.select('.keyLevels').selectAll('line').remove()
        stockCandleSVG.select('.keyLevels').selectAll('text').remove()
        stockCandleSVG.select('.keyLevels').selectAll('rect').remove()

        if (preDimensionsAndCandleCheck() || !KeyLevels) return
        let keyLevelSelection = stockCandleSVG.select('.keyLevels')
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
            stockCandleSVG.select('.keyLevels').append('text').attr('class', 'keyLevelSubText').text('2SD').attr("x", candleDimensions.width - textOffSetFromRight / 2).attr("y", twoSigmaUpper)
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

        if (KeyLevels.dailyZone)
        {

            let lowPixel = createPriceScale({ priceToPixel: KeyLevels.dailyZone.low })
            let midPixel = createPriceScale({ priceToPixel: KeyLevels.dailyZone.mid })
            let highPixel = createPriceScale({ priceToPixel: KeyLevels.dailyZone.high })
            let closePixel = createPriceScale({ priceToPixel: KeyLevels.dailyZone.close })
            let trendPixel = createPriceScale({ priceToPixel: KeyLevels.dailyZone.trend })

            keyLevelSelection.append('line')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('stroke', 'yellow').attr('stroke-dasharray', '10 10')
                .attr('y1', lowPixel).attr('y2', lowPixel).attr('opacity', 0.5)

            keyLevelSelection.append('rect').attr('x', 0).attr('width', 5000).attr('fill', "url(#zoneBearish)").attr('opacity', 0.15)
                .attr('y', (d) => midPixel).attr('height', d => lowPixel - midPixel)
            keyLevelSelection.append('rect').attr('x', 0).attr('width', 5000).attr('fill', 'url(#zoneBullish)').attr('opacity', 0.15)
                .attr('y', (d) => highPixel).attr('height', d => midPixel - highPixel)

            keyLevelSelection.append('line')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('stroke', 'blue').attr('stroke-dasharray', '10 10')
                .attr('y1', midPixel).attr('y2', midPixel)
            keyLevelSelection.append('line')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('stroke', 'red').attr('stroke-dasharray', '10 10').attr('opacity', 0.5)
                .attr('y1', highPixel).attr('y2', highPixel)
            keyLevelSelection.append('line')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('stroke', 'black').attr('opacity', 1)
                .attr('y1', closePixel).attr('y2', closePixel)
            keyLevelSelection.append('line')
                .attr('x1', 0).attr('x2', candleDimensions.width)
                .attr('stroke', 'black').attr('opacity', 1).attr('stroke-dasharray', '10 10')
                .attr('y1', trendPixel).attr('y2', trendPixel)
        }

    }, [ticker, KeyLevels, candleData, displayMarketHours, candleDimensions, chartZoomState?.x, chartZoomState?.y,])









    //configure svg cross hair, context menu, and tool interactions
    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return
        initializeMouseCrossHairBehavior()
        if (!isInteractive) return
        if (!stockCandleSVG.on('contextmenu'))
        {
            stockCandleSVG.on('contextmenu', (e) =>
            {
                e.preventDefault();
                let xPosition = e.offsetX; if (xPosition > candleDimensions.width - 400) xPosition = candleDimensions.width - 400
                let yPosition = e.offsetY; if (yPosition > candleDimensions.height - 300) yPosition = candleDimensions.height - 300
                setShowContextMenu({ display: true, style: { left: `${xPosition}px`, top: `${yPosition}px` } })
            })
        }

        let toolingFunction = toolFunctionExports[ChartingTools.findIndex(t => t.tool === currentTool)]
        stockCandleSVG.on('click', (e) => toolingFunction(e, setEnableZoom, candleSVG.current, pixelSet, setCaptureComplete, createDateScale, createPriceScale))
    }, [currentTool, candleDimensions, candleData, chartZoomState?.x, chartZoomState?.y,])

    //update charting state post trace
    useEffect(() =>
    {
        if (!captureComplete || preDimensionsAndCandleCheck() || !isInteractive) return

        let completeCapture = {}
        let pixelCapture = pixelSet.current

        if (currentTool === 'Enter Exit' && pixelCapture?.X1)
        {
            completeCapture.dateP1 = new Date(createDateScale({ pixelToDate: pixelCapture.X1 })).toISOString()

            completeCapture.enterPrice = createPriceScale({ pixelToPrice: pixelCapture.Y1 })
            completeCapture.enterBufferPrice = createPriceScale({ pixelToPrice: pixelCapture.Y2 })
            completeCapture.stopLossPrice = createPriceScale({ pixelToPrice: pixelCapture.Y3 })
            completeCapture.exitPrice = createPriceScale({ pixelToPrice: pixelCapture.Y4 })
            completeCapture.exitBufferPrice = createPriceScale({ pixelToPrice: pixelCapture.Y5 })
            completeCapture.moonPrice = createPriceScale({ pixelToPrice: pixelCapture.Y6 })

            completeCapture.percents = [pixelCapture.P1, pixelCapture.P2, pixelCapture.P4, pixelCapture.P3, pixelCapture.P5]

            if (EnterExitPlan)
            {
                dispatch(defineEnterExitPlan({ ticker, enterExitPlan: completeCapture }))
                attemptToUpdateEnterExit()
            } else { dispatch(addEnterExitToCharting({ ticker, enterExit: completeCapture })) }

        } else if (pixelCapture?.X1)
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
        if (preDimensionsAndCandleCheck() || !graphElementVisibility) return

        if (graphElementVisibility.showAll && !graphElementVisibility.showOnlyEnterExit)
        {
            graphElementVisibility.anyFreeLines ?
                toggleAnyVisible(allPossibleClassNames[0], graphElementVisibility.freeLines, graphElementVisibility.previousFreeLines) :
                toggleSelectToHidden(allPossibleClassNames[0])

            // graphElementVisibility.anyLinesH ? toggleAnyVisible(allPossibleClassNames[1], graphElementVisibility.linesH, graphElementVisibility.previousLinesH) : toggleSelectToHidden(allPossibleClassNames[1])
            // graphElementVisibility.anyTrendLines ? toggleAnyVisible(allPossibleClassNames[2], graphElementVisibility.trendLines, graphElementVisibility.previousTrendLines) : toggleSelectToHidden(allPossibleClassNames[2])
            // graphElementVisibility.anyWedges ? toggleAnyVisible(allPossibleClassNames[3], graphElementVisibility.wedges, graphElementVisibility.previousWedges) : toggleSelectToHidden(allPossibleClassNames[3])
            // graphElementVisibility.anyChannels ? toggleAnyVisible(allPossibleClassNames[4], graphElementVisibility.channels, graphElementVisibility.previousChannels) : toggleSelectToHidden(allPossibleClassNames[4])
            // graphElementVisibility.anyTriangles ? toggleAnyVisible(allPossibleClassNames[5], graphElementVisibility.triangles, graphElementVisibility.previousTriangles) : toggleSelectToHidden(allPossibleClassNames[5])

            graphElementVisibility.anyEnterExits ?
                toggleAnyVisible(allPossibleClassNames[6], graphElementVisibility.enterExits, graphElementVisibility.previousEnterExits) :
                toggleSelectToHidden(allPossibleClassNames[6])

        }
        else if (graphElementVisibility.showOnlyEnterExit)
        {
            toggleAnyVisible(allPossibleClassNames[6], graphElementVisibility.enterExits, graphElementVisibility.previousEnterExits)
            toggleSelectToHidden(allPossibleClassNames[0])
        }
        else { allPossibleClassNames.map((singleClass, i) => { toggleSelectToHidden(singleClass) }) }

        if (graphElementVisibility.enterExitText)
        { stockCandleSVG.select('.enterExits').selectAll('text').attr('visibility', 'visible') }
        else { stockCandleSVG.select('.enterExits').selectAll('text').attr('visibility', 'hidden') }

        function toggleAnyVisible(className, showCurrentSpecific, showPreviousSpecific)
        {
            stockCandleSVG.select(className).selectAll(lineGroupClassName).attr('visibility', () => { if (graphElementVisibility.showAnyCurrent) return showCurrentSpecific ? 'visible' : 'hidden'; else return 'hidden' })
            stockCandleSVG.select(className).selectAll('.previous').attr('visibility', () => { if (graphElementVisibility.showAnyPrevious) return showPreviousSpecific ? 'visible' : 'hidden'; else return 'hidden' })
        }
        function toggleSelectToHidden(className)
        {
            stockCandleSVG.select(className).selectAll(lineGroupClassName).attr('visibility', 'hidden')
        }

    }, [charting, graphElementVisibility, EnterExitPlan])

    //keyboard event listeners
    useEffect(() =>
    {
        if (!captureComplete) { document.addEventListener('keydown', (e) => { resetTempBeforeCompletion(e); deleteSelectedEditChartElement(e) }) }
        else { document.removeEventListener('keydown', resetTempBeforeCompletion) }

        function resetTempBeforeCompletion(e)
        {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
            if (e.key === 'Escape')
            {
                e.preventDefault()
                resetTemp()
            }
        }
        function deleteSelectedEditChartElement(e)
        {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

            if (e.key === 'Delete')
            {
                e.preventDefault()
                dispatch(removeChartingElement({ ...editChartElement, ticker }))
            }
        }

        return (() =>
        {
            document.removeEventListener('keydown', resetTempBeforeCompletion)
            document.removeEventListener('keydown', deleteSelectedEditChartElement)
        })
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
        dispatch(setGraphToSubGraphCrossHair({ uuid, x: crossHairCoordinates.svgX - crossHairCoordinates.mouseHoverOffset }))
    }

    function clearCrossHairs(e)
    {
        dispatch(setNoCurrentCrossHair({ uuid }))
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

        let percentEnterStop = ((update.enterPrice - update.stopLossPrice) / update.enterPrice) * 100
        let percentEnterBuffer = ((update.enterBufferPrice - update.enterPrice) / update.enterPrice) * 100
        let percentExitBuffer = ((update.exitBufferPrice - update.enterPrice) / update.enterPrice) * 100
        let percentExit = ((update.exitPrice - update.enterPrice) / update.enterPrice) * 100
        let percentMoon = ((update.moonPrice - update.enterPrice) / update.enterPrice) * 100
        update.percents = [parseFloat(percentEnterStop.toFixed(2)), parseFloat(percentEnterBuffer.toFixed(2)),
        parseFloat(percentExitBuffer.toFixed(2)), parseFloat(percentExit.toFixed(2)), parseFloat(percentMoon.toFixed(2))]

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
            {showContextMenu.display && <ChartContextMenuContainer uuid={uuid} showContextMenu={showContextMenu} ticker={ticker} chartId={chartId} setShowContextMenu={setShowContextMenu} setChartInfoDisplay={setChartInfoDisplay} timeFrame={timeFrame} setTimeFrame={setTimeFrame} />}

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
                            <stop offset="0%" stop-color="blue" stop-opacity="0" />
                            <stop offset="75%" stop-color="blue" stop-opacity="1" />
                            <stop offset="100%" stop-color="blue" stop-opacity="1" />
                        </linearGradient>
                        <linearGradient id="fadeHighVolume" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="green" stop-opacity="0" />
                            <stop offset="75%" stop-color="green" stop-opacity="1" />
                            <stop offset="100%" stop-color="green" stop-opacity="1" />
                        </linearGradient>

                        <linearGradient id="zoneBearish" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="yellow" stop-opacity="1" />
                            <stop offset="80%" stop-color="yellow" stop-opacity=".75" />
                            <stop offset="100%" stop-color="red" stop-opacity="1" />
                        </linearGradient>
                        <linearGradient id="zoneBullish" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="blue" stop-opacity="1" />
                            <stop offset="90%" stop-color="yellow" stop-opacity="1" />
                            <stop offset="100%" stop-color="yellow" stop-opacity="1" />
                        </linearGradient>
                    </defs>
                    <g className='x-axis' />
                    <g className='visualDateBreaks' />
                    <g className='keyLevels' />
                    <g className='initialTrack' />
                    <g className='enterExits' />
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
                    <g className='freeLines' />
                    <g className='linesH' />
                    <g className='trendLines' />
                    <g className='wedges' />
                    <g className='lowVolumeNodes' />
                    <g className='highVolumeNodes' />
                    <g className='channels' />
                    <g className='triangles' />
                    <g className='currentPrice' />
                </svg>
            </div>
        </div>
    )
}

export default ChartGraph