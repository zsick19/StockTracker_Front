import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useResizeObserver } from '../../../../../../../hooks/useResizeObserver'
import { select, scaleTime, min, max, line, scaleLinear, curveLinear } from 'd3'
import { isWeekend, previousFriday } from 'date-fns'

function MiniFiveMinChart({ candleData, openPrice, enterPrice, enterBufferPrice, stopLossPrice, direction, xScaleFromCandles, yesterdayCandles })
{
    if (!candleData) return <div className='blankMiniFiveMin'></div>
    const preDimensionsAndCandleCheck = () => { return !candleDimensions }
    const candleSVG = useRef()
    const candleSVGWrapper = useRef(null)
    let candleDimensions = useResizeObserver(candleSVGWrapper)
    const stockCandleSVG = select(candleSVG.current)

    const minPrice = useMemo(() =>
    {
        let minPriceFromData = min(candleData, d => d.ClosePrice)
        if (openPrice < minPriceFromData)
            return openPrice
        else return minPriceFromData
    }, [candleData])
    const maxPrice = useMemo(() =>
    {
        let maxPriceFromData = max(candleData, d => d.ClosePrice)
        if (openPrice > maxPriceFromData) return openPrice
        else return maxPriceFromData
    }, [candleData])



    const createDateScale = useCallback((dateToPixel) =>
    {
        if (preDimensionsAndCandleCheck()) return
        let startOfTradingDay
        let endOfTradingDay
        if (yesterdayCandles)
        {
            startOfTradingDay = new Date(candleData[0].Timestamp)
            startOfTradingDay.setHours(9, 30)
            endOfTradingDay = new Date(startOfTradingDay)
            endOfTradingDay.setHours(16)
        }
        else if (xScaleFromCandles)
        {
            startOfTradingDay = new Date(candleData[0].Timestamp)
            endOfTradingDay = new Date(startOfTradingDay)
            startOfTradingDay.setHours(9, 30)
            endOfTradingDay.setHours(16, 0)
        } else
        {
            startOfTradingDay = new Date()
            endOfTradingDay = new Date()
            if (isWeekend(startOfTradingDay))
            {
                startOfTradingDay = previousFriday(startOfTradingDay)
                endOfTradingDay = previousFriday(endOfTradingDay)
            }
            startOfTradingDay.setHours(9, 30)
            endOfTradingDay.setHours(16, 0)
        }

        let xDateScale = scaleTime().domain([startOfTradingDay, endOfTradingDay]).range([0, candleDimensions.width])

        return xDateScale(new Date(dateToPixel))


    }, [candleData, candleDimensions])


    const createPriceScale = useCallback((priceToPixel) =>
    {
        if (preDimensionsAndCandleCheck()) return
        const yScale = scaleLinear()
            .domain([minPrice * .99, maxPrice * 1.01])
            .range([candleDimensions.height, 0])

        return yScale(priceToPixel)
    }, [candleData, candleDimensions])


    const fiveMinLine = line().x(d => createDateScale(d.Timestamp)).y(d => createPriceScale(d.ClosePrice)).curve(curveLinear)

    useEffect(() =>
    {
        if (preDimensionsAndCandleCheck()) return

        if (openPrice)
        {
            let openPricePixel = createPriceScale(openPrice)
            stockCandleSVG.select('.openLine').attr('x1', 0).attr('x2', 100).attr('y1', openPricePixel).attr('y2', openPricePixel)
                .attr('stroke', 'white').attr('stroke-width', '1px').attr('stroke-dasharray', '3 3').attr('opacity', 0.25)
        }

        if (enterPrice)
        {
            let enterPricePixel = createPriceScale(enterPrice)
            stockCandleSVG.select('.enterLine').attr('x1', 0).attr('x2', 100).attr('y1', enterPricePixel).attr('y2', enterPricePixel)
                .attr('stroke', 'green').attr('stroke-width', '1px').attr('stroke-dasharray', '3 3')
        }
        if (enterBufferPrice)
        {
            let enterPricePixel = createPriceScale(enterBufferPrice)
            stockCandleSVG.select('.enterBufferLine').attr('x1', 0).attr('x2', 100).attr('y1', enterPricePixel).attr('y2', enterPricePixel)
                .attr('stroke', 'yellow').attr('stroke-width', '1px').attr('stroke-dasharray', '3 3')
        }

        if (stopLossPrice)
        {
            let stopLossPixel = createPriceScale(stopLossPrice)
            stockCandleSVG.select('.stopLossLine').attr('x1', 0).attr('x2', 100).attr('y1', stopLossPixel).attr('y2', stopLossPixel)
                .attr('stroke', 'red').attr('stroke-width', '1px').attr('stroke-dasharray', '3 3')
        }

        stockCandleSVG.select('.fiveMinLine').select('.five').attr('stroke', 'white').attr('fill', 'none').attr('stroke-width', '1px')
            .attr('d', () => fiveMinLine(candleData)).attr('stroke', direction ? 'green' : 'red')

    }, [candleDimensions, candleData, direction])



    return (
        <div ref={candleSVGWrapper} className='MiniFiveMinChartWrapper'>
            <svg ref={candleSVG}>
                <line className='openLine' />
                <line className='enterLine' />
                <line className='enterBufferLine' />
                <line className='stopLossLine' />
                <g className='fiveMinLine' >
                    <path className='five' />
                </g>
            </svg>
        </div>
    )
}

export default MiniFiveMinChart