import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useFetchUsersMacroWatchListQuery } from '../../../../../../../../../features/WatchList/WatchListStreamingSliceApi'
import { useResizeObserver } from '../../../../../../../../../hooks/useResizeObserver'
import { color, scaleLinear, select, selectAll } from 'd3';
import MacroZoneDiagram from './MacroZoneDiagram';
import { TrendingDown, TrendingUp } from 'lucide-react';
import MiniFiveMinChart from '../../../../../../StockDetailSection/Components/TinyPreWatch/Components/MiniFiveMinChart';

function SingleMacroZone({ macroTicker, zoneData, candleData, setSelectedMacro })
{
    const { item } = useFetchUsersMacroWatchListQuery(undefined, { selectFromResult: ({ data }) => ({ item: data?.tickerState.entities[macroTicker] }) })


    const conditionDiagramRef = useRef()
    const conditionDiagramWrapperRef = useRef()
    const diagramDimensions = useResizeObserver(conditionDiagramWrapperRef)
    const diagramSVG = select(conditionDiagramRef.current)
    const [borderColor, setBorderColor] = useState('#000000')
    const yScale = useCallback((priceToPixel) =>
    {
        if (!diagramDimensions) return
        const scale = scaleLinear().domain([zoneData.high, zoneData.low]).range([0, diagramDimensions.height])
        return scale(priceToPixel)
    }, [diagramDimensions, zoneData])


    useEffect(() =>
    {
        if (!diagramDimensions) return

        let lowPixel = yScale(zoneData.low)
        let midPixel = yScale(zoneData.mid)
        let highPixel = yScale(zoneData.high)
        let closePixel = yScale(zoneData.close)
        let trendPixel = yScale(zoneData.trend)

        let keyLevelSelection = diagramSVG.select('.zonePoints')

        keyLevelSelection.append('rect').attr('x', 0).attr('width', 5000).attr('fill', "url(#zoneBearish)").attr('opacity', 0.25)
            .attr('y', (d) => midPixel).attr('height', d => lowPixel - midPixel)
        keyLevelSelection.append('rect').attr('x', 0).attr('width', 5000).attr('fill', 'url(#zoneBullish)').attr('opacity', 0.25)
            .attr('y', (d) => highPixel).attr('height', d => midPixel - highPixel)

        keyLevelSelection.append('line')
            .attr('x1', 0).attr('x2', diagramDimensions.width)
            .attr('stroke', 'gray')
            .attr('y1', midPixel).attr('y2', midPixel)

        keyLevelSelection.append('line')
            .attr('x1', 0).attr('x2', diagramDimensions.width)
            .attr('stroke', 'black').attr('opacity', 0.6)
            .attr('y1', closePixel).attr('y2', closePixel)

        keyLevelSelection.append('line')
            .attr('x1', 0).attr('x2', diagramDimensions.width)
            .attr('stroke', 'blue').attr('opacity', 1).attr('stroke-dasharray', '10 10')
            .attr('y1', trendPixel).attr('y2', trendPixel)

    }, [zoneData, diagramDimensions])
    useEffect(() =>
    {
        if (!diagramDimensions) return

        diagramSVG.select('.price').selectAll('line').remove()
        diagramSVG.select('.price').append('line')
            .attr('class', 'currentPrice')
            .attr('x1', 0).attr('x2', diagramDimensions.width)
            .attr('y1', yScale(item.mostRecentPrice))
            .attr('y2', yScale(item.mostRecentPrice))
            .attr('stroke-width', '4px')
            .attr('stroke', 'green')

        if (item.mostRecentPrice > item.dailyOpenPrice) { setBorderColor('green') }
        else if (item.mostRecentPrice < item.dailyOpenPrice) { setBorderColor('red') }
        else setBorderColor('blue')

    }, [item?.mostRecentPrice, diagramDimensions])

    return (
        <div className='SingleMacroZone'>
            <MacroZoneDiagram zoneData={zoneData} item={item} />
            <div className='MacroZoneTickerPriceDetail'>
                <h3>{zoneData.trend > zoneData.close ? <TrendingUp color='green' size={12} /> : <TrendingDown color='red' size={12} />} {macroTicker}</h3>
                <p className={`${item.mostRecentPrice > item.dailyOpenPrice ? 'upDayPrice' : 'downDayPrice'} macroPrice`}>{item?.mostRecentPrice.toFixed(2)}</p>

                <div className={`${item.mostRecentPrice > item.dailyOpenPrice ? 'upDayDetails' : 'downDayDetails'} macroPriceZoneDetails`}>
                    <p>${(item.mostRecentPrice - item.dailyOpenPrice).toFixed(2)}</p>
                    <p>{item.currentDayPercentGain.toFixed(2)}%</p>
                </div>

                <MiniFiveMinChart candleData={candleData} openPrice={item.dailyOpenPrice} direction={item.mostRecentPrice > item.dailyOpenPrice} />
            </div>

        </div>
    )
}

export default SingleMacroZone