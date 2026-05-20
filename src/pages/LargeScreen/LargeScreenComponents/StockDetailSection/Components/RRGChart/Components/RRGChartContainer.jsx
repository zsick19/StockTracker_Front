import React, { useEffect, useMemo, useRef } from 'react'
import { calculateRRGCoordinates } from '../RRGCalc'
import { useResizeObserver } from '../../../../../../../hooks/useResizeObserver'
import { axisBottom, axisLeft, line, scaleLinear, select, selectAll } from 'd3'
import { sectorColors } from '../../../../../../../Utilities/SectorsAndIndustries'

function RRGChartContainer({ candleData, tailLength })
{

    const RRGData = useMemo(() => candleData.sectors.map((sector) => calculateRRGCoordinates(sector, candleData.compare.candleData).slice(-tailLength)), [candleData, tailLength])
    const maxMin = useMemo(() =>
    {
        let max = 0
        let min = 0
        RRGData.forEach((d) =>
        {
            d.forEach(t =>
            {

                if (max < t.x) max = t.x
                else if (max < t.y) max = t.y

                if (min > t.x) min = t.x
                else if (min > t.y) min = t.y
            }
            )
        })
        return max - 100
    }, [RRGData])

    const rrgRefWrapper = useRef()
    const rrgRef = useRef()
    let graphDimensions = useResizeObserver(rrgRefWrapper)
    const rrgSVG = select(rrgRef.current)
    const preDimensionsAndCandleCheck = () => { return graphDimensions }

    // 4. Scales Logic (Memoized for performance)
    const xScale = useMemo(() =>
    {
        if (!preDimensionsAndCandleCheck()) return
        return scaleLinear()
            .domain([99 - maxMin, maxMin + 101])
            .range([0, graphDimensions.width]);
    }, [RRGData, graphDimensions]);

    const yScale = useMemo(() =>
    {
        if (!preDimensionsAndCandleCheck()) return
        return scaleLinear()
            .domain([99 - maxMin, maxMin + 101])
            .range([graphDimensions.height, 0]); // Inverted y-axis for screen coordinates
    }, [RRGData, graphDimensions]);


    useEffect(() =>
    {
        if (!preDimensionsAndCandleCheck()) return
        rrgSVG.select('.xAxis').style('transform', `translateY(${graphDimensions.height / 2}px)`).call(axisBottom(xScale))
        rrgSVG.select('.yAxis').style('transform', `translateX(${graphDimensions.width / 2}px)`).call(axisLeft(yScale))
    }, [candleData, xScale, yScale, graphDimensions])

    const connectingLine = line().x(d => xScale(d.x)).y(d => yScale(d.y));


    useEffect(() =>
    {
        if (!preDimensionsAndCandleCheck()) return

        rrgSVG.select('.graphPoints').selectAll('.singleSector').data(RRGData).join(enter => createCandles(enter), update => updateCandles(update))
        function createCandles(enter)
        {

            enter.each(function (d, i)
            {
                var tickerGroups = select(this).append('g').attr('class', 'singleSector')

                d.forEach(element =>
                {
                    tickerGroups.append('circle').attr('class', 'graphPoint')
                        .attr('cx', xScale(element.x))
                        .attr('cy', yScale(element.y))
                        .attr('r', 3)
                        .attr('fill', sectorColors[element.Symbol])

                    tickerGroups.append('path').attr('class', 'connectingPath')
                        .attr('d', (element) => connectingLine(element))
                        .attr('stroke', sectorColors[element.Symbol])
                        .attr('fill', 'none')

                });
                const currentPoint = d.at(-1)
                tickerGroups.append("circle")
                    .attr("cx", xScale(currentPoint.x))
                    .attr("cy", yScale(currentPoint.y))
                    .attr("r", 6)
                    .attr("fill", "#1a73e8");

                // Label the current position with the ETF symbol
                tickerGroups.append("text")
                    .attr("x", xScale(currentPoint.x) + 8)
                    .attr("y", yScale(currentPoint.y) + 4)
                    .text(currentPoint.Symbol)
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold")
                    .attr('fill', sectorColors[currentPoint.Symbol])

            })
        }
        function updateCandles(update)
        {
            update.each(function (d, i)
            {
                // const candle = select(this)
                // candle.attr("transform", (d) => { return `translate(${createDateScale({ dateToPixel: d.Timestamp })},0)` })
                // candle.select('.lowHigh').attr('y1', (d) => createPriceScale({ priceToPixel: d.LowPrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.HighPrice }))
                // candle.select('.openClose').attr('y1', (d) => createPriceScale({ priceToPixel: d.ClosePrice })).attr('y2', (d) => createPriceScale({ priceToPixel: d.OpenPrice }))
            })
        }



    }, [RRGData, xScale, yScale, graphDimensions])






    return (
        <div id='SVGRRGWrapper' ref={rrgRefWrapper}>
            <svg ref={rrgRef}>

                <g className='xAxis' />

                <g className='yAxis' />
                <g className='graphPoints' />
            </svg>
        </div>
    )
}

export default RRGChartContainer