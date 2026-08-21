import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useResizeObserver } from '../../../../../../../hooks/useResizeObserver';
import { useSelector } from 'react-redux';
import { selectLargeOrderThresholdById, selectNewsRunnerLargeSmallOrderById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice';


function OrderSizeVisual({ ticker })
{
    const tradeQuoteMetrics = useSelector((state) => selectNewsRunnerLargeSmallOrderById(state, ticker))
    const data = tradeQuoteMetrics.historicalChartIntervals
    const largeOrderThreshold = useSelector((state) => selectLargeOrderThresholdById(state, ticker))

    // const orderSVG = useRef()
    // const orderSVGWrapper = useRef(null)

    // let orderPriceDimensions = useResizeObserver(orderSVGWrapper)

    // const orderSelection = select(orderSVG.current)

    const containerRef = useRef(null);

    // Layout geometry dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 700 - margin.left - margin.right;

    const gap = 20; // Gap spacing between sub-charts
    const equalHeight = 100
    // Heights for the three individual stacked panels
    const priceHeight = equalHeight;
    const volumeHeight = equalHeight;
    const deltaHeight = equalHeight;

    const totalSVGHeight = priceHeight + volumeHeight + deltaHeight + (gap * 2) + margin.top + margin.bottom;

    // Compute Scales and Paths natively within useMemo to avoid lag on re-renders
    const paths = useMemo(() =>
    {
        if (!data || data.length === 0) return null;

        // 1. Configure the X-Axis discrete index scale band
        const xScale = d3.scaleBand()
            .domain(d3.range(data.length))
            .range([0, width])
            .padding(0.2);

        // 2. Configure Y-Scales for each individual tracking matrix
        const priceMin = d3.min(data, d => d.lastPrice) * 0.95;
        const priceMax = d3.max(data, d => d.lastPrice) * 1.05;
        const yScalePrice = d3.scaleLinear().domain([priceMin, priceMax]).range([priceHeight, 0]);

        const maxVolume = d3.max(data, d => Math.max(d.largeVolume, d.smallVolume)) * 1.1;
        const yScaleVolume = d3.scaleLinear().domain([0, maxVolume]).range([volumeHeight, 0]);


        const maxLeakage = d3.max(data, d => d.spreadLeakage) * 1.1 || 0.05;
        const yScaleLeakage = d3.scaleLinear().domain([0, maxLeakage]).range([volumeHeight, 0]);



        const maxDelta = d3.max(data, d => Math.abs(d.aggressionDelta)) * 1.1 || 10000;
        const yScaleDelta = d3.scaleLinear().domain([-maxDelta, maxDelta]).range([deltaHeight, 0]);

        // 3. Calculate 9-period EMA baseline data points inside the loop
        let emaPeriod = 9;
        let k = 2 / (emaPeriod + 1);
        let currentEma = data[0].lastPrice;

        const chartPoints = data.map((d, i) =>
        {
            if (i > 0) { currentEma = d.lastPrice * k + currentEma * (1 - k); }
            return { ...d, ema: currentEma, index: i };
        });

        // 4. Generate SVG Path Strings in a Single Chronological Sweep
        const priceLineGen = d3.line().x(d => xScale(d.index) + xScale.bandwidth() / 2).y(d => yScalePrice(d.lastPrice));
        const emaLineGen = d3.line().x(d => xScale(d.index) + xScale.bandwidth() / 2).y(d => yScalePrice(d.ema));
        const deltaLineGen = d3.line().x(d => xScale(d.index) + xScale.bandwidth() / 2).y(d => yScaleDelta(d.aggressionDelta));
        const vwapLineGenerator = d3.line().x(d => xScale(d.index) + xScale.bandwidth() / 2).y(d => yScalePrice(d.anchoredSessionVwap));
        const leakageAreaGenerator = d3.area()
            .x((d) => xScale(d.index) + xScale.bandwidth() / 2)
            .y0(volumeHeight) // Glues baseline path boundary to floor of panel 2
            .y1(d => yScaleLeakage(d.spreadLeakage))
            .curve(d3.curveMonotoneX);

        // Area path generators to shade the green/red buying/selling zones anchored to center zero line
        const deltaAreaAboveGen = d3.area()
            .x(d => xScale(d.index) + xScale.bandwidth() / 2)
            .y0(yScaleDelta(0))
            .y1(d => d.aggressionDelta > 0 ? yScaleDelta(d.aggressionDelta) : yScaleDelta(0));

        const deltaAreaBelowGen = d3.area()
            .x(d => xScale(d.index) + xScale.bandwidth() / 2)
            .y0(yScaleDelta(0))
            .y1(d => d.aggressionDelta < 0 ? yScaleDelta(d.aggressionDelta) : yScaleDelta(0));

        return {
            xScale,
            yScalePrice,
            yScaleVolume,
            yScaleDelta,
            priceLine: priceLineGen(chartPoints),
            emaLine: emaLineGen(chartPoints),
            VWAPLine: vwapLineGenerator(chartPoints),
            slippage: leakageAreaGenerator(chartPoints),
            deltaLine: deltaLineGen(chartPoints),
            deltaAreaAbove: deltaAreaAboveGen(chartPoints),
            deltaAreaBelow: deltaAreaBelowGen(chartPoints),
            chartPoints
        };
    }, [data, width]);

    // Use useEffect exclusively to render the custom D3 Axes ticks and layout lines
    useEffect(() =>
    {
        if (!paths) return;

        const svg = d3.select(containerRef.current);
        svg.selectAll('.axis').remove(); // Clean sweep old renders

        // Generate Custom Elapsed Time Ticks (+5s, +10s, +1m)
        const xAxisGenerator = d3.axisBottom(paths.xScale)
            .tickFormat(idx =>
            {
                const seconds = idx * 5;
                if (seconds < 60) return `+${seconds}s`;
                return `+${Math.floor(seconds / 60)}m${seconds % 60 > 0 ? (seconds % 60) + 's' : ''}`;
            })
            .tickValues(paths.xScale.domain().filter((_, i) => i % 3 === 0)); // Render a tick mark label every 15s

        const yAxisPrice = d3.axisLeft(paths.yScalePrice).ticks(5).tickFormat(d => `$${d.toFixed(2)}`);
        const yAxisVolume = d3.axisLeft(paths.yScaleVolume).ticks(4).tickFormat(d3.format(".1s"));
        const yAxisDelta = d3.axisLeft(paths.yScaleDelta).ticks(4).tickFormat(d3.format(".1s"));

        // Render Price Axis Group
        svg.append('g')
            .attr('class', 'axis price-axis')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .call(yAxisPrice);

        // Render Volume Axis Group
        svg.append('g')
            .attr('class', 'axis volume-axis')
            .attr('transform', `translate(${margin.left}, ${margin.top + priceHeight + gap})`)
            .call(yAxisVolume);

        // Render Aggression Delta Axis Group
        svg.append('g')
            .attr('class', 'axis delta-axis')
            .attr('transform', `translate(${margin.left}, ${margin.top + priceHeight + volumeHeight + (gap * 2)})`)
            .call(yAxisDelta);

        // Render Timed X-Axis on the absolute bottom layout boundary
        svg.append('g')
            .attr('class', 'axis x-axis-timeline')
            .attr('transform', `translate(${margin.left}, ${margin.top + priceHeight + volumeHeight + deltaHeight + (gap * 2)})`)
            .call(xAxisGenerator)
            .selectAll('text')
            .attr('fill', '#9ca3af')
            .style('font-size', '11px');

        svg.selectAll('.axis path, .axis line').attr('stroke', '#374151');
        svg.selectAll('.axis text').attr('fill', '#9ca3af');

        const sweepIndicators = svg.select('.aggressionDelta').select('.sweepIndicators')
        const iceBergIndicators = svg.select('.PriceEMAVWAP').select('.iceBergs')
        sweepIndicators.selectAll('circle').remove()
        iceBergIndicators.selectAll('line').remove()
        iceBergIndicators.selectAll('text').remove()

        data.forEach((d, i) =>
        {

            if (d.icebergRatio >= 0.20)
            {
                const xStart = paths.xScale(i)
                const xEnd = xStart + paths.xScale.bandwidth();
                const yPrice = paths.yScalePrice(d.lastPrice);
                // Render a thick, horizontal gray brick line over this exact price vertex coordinate
                iceBergIndicators.append('line')
                    .attr('x1', xStart)
                    .attr('x2', xEnd)
                    .attr('y1', yPrice)
                    .attr('y2', yPrice)
                    .attr('stroke', '#9ca3af') // Steel gray industrial wall indicator
                    .attr('stroke-width', '4')
                    .attr('class', 'iceberg-cap-marker');

                // Add a micro warning indicator text cap above the line
                iceBergIndicators.append('text')
                    .attr('x', xStart)
                    .attr('y', yPrice - 6)
                    .attr('fill', '#9ca3af')
                    .style('font-size', '9px')
                    .style('font-family', 'sans-serif')
                    .style('font-weight', 'bold')
                    .text('ICEBERG');
            }



            if (d.sweepRatio >= 0.25)
            {
                const xCenter = paths.xScale(i) + paths.xScale.bandwidth() / 2;
                // Align perfectly along the exact vertical position of your orange oscillator line
                const yCenter = paths.yScaleDelta(d.aggressionDelta);

                // Render an inner bright target dot indicating institutional sweep routing activity
                sweepIndicators.append('circle')
                    .attr('cx', xCenter)
                    .attr('cy', yCenter)
                    .attr('r', 4)
                    .attr('fill', '#f43f5e') // Hot neon magenta alert target
                    .attr('class', 'sweep-indicator');

                // Render an outer pulsing radar target boundary circle ring
                sweepIndicators.append('circle')
                    .attr('cx', xCenter)
                    .attr('cy', yCenter)
                    .attr('r', 8)
                    .attr('fill', 'none')
                    .attr('stroke', '#f43f5e')
                    .attr('stroke-width', '1')
                    .attr('opacity', d.sweepRatio * 0.8) // Transparency matches the sweep intensity
                    .attr('class', 'sweep-indicator-ring');
            }


        })

    }, [paths]);

    if (!paths) return <div className="text-gray-400">Awaiting RTPR Stream Activation...</div>;

    return (
        <div >
            <svg ref={containerRef} width={width + margin.left + margin.right} height={totalSVGHeight} className="overflow-visible"            >
                <defs>
                    <linearGradient id="leakage-gradient" x1="0" y1="0" x2="0" y2="1">
                        {/* Top boundary: Bright, semi-translucent purple indicating severe leakage */}
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />

                        {/* Midpoint blend */}
                        <stop offset="50%" stopColor="#6366f1" stopOpacity="0.20" />

                        {/* Bottom boundary: Fades cleanly to transparent at the floor of the volume panel */}
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                    </linearGradient>
                </defs>
                {/* PANEL 1: PRICE & SCALING EMA RIBBON */}
                <g transform={`translate(${margin.left}, ${margin.top})`}
                    style={{ transition: 'transform 0.3s ease-in-out' }} className='PriceEMAVWAP'>
                    {/* Subtle Gridlines */}
                    {paths.yScalePrice.ticks(5).map((t, idx) => (
                        <line key={idx} x1={0} x2={width} y1={paths.yScalePrice(t)} y2={paths.yScalePrice(t)} stroke="#3c4858" strokeDasharray="2,4" />
                    ))}

                    <g className='iceBergs' />
                    <path d={paths.emaLine} fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="3,3" opacity="0.8" />
                    <path d={paths.priceLine} fill="none" stroke="#3b82f6" strokeWidth="3" />
                    <path d={paths.VWAPLine} fill='none' stroke="#ec4899" strokeWidth='2' strokeDasharray='4,4' />
                    <text x={10} y={15} fill="#3b82f6" className="">Price</text>
                    <text x={50} y={15} fill="#eab308" className="">9-EMA</text>
                    <text x={100} y={15} fill="#ec4899" className="">Anchor VWAP</text>
                </g>

                {/* PANEL 2: SEPARATED HISTOGRAM BARS (INSTITUTIONAL VS RETAIL) */}
                <g transform={`translate(${margin.left}, ${margin.top + priceHeight + gap})`}
                    style={{ transition: 'transform 0.3s ease-in-out' }}>
                    {paths.chartPoints.map((d) =>
                    {
                        const barW = paths.xScale.bandwidth() / 2 - 1;
                        const xLarge = paths.xScale(d.index);
                        const xSmall = paths.xScale(d.index) + barW + 1;

                        return (
                            <g key={d.index}>
                                {/* Large Block Orders: High Bright Green Bars */}
                                <path d={paths.slippage} fill="url(#leakage-gradient)" opacity='0.4' />
                                <rect
                                    x={xLarge}
                                    y={paths.yScaleVolume(d.largeVolume)}
                                    width={barW}
                                    height={volumeHeight - paths.yScaleVolume(d.largeVolume)}
                                    fill="#10b981"
                                    opacity={d.largeVolume > 0 ? 1 : 0.1}
                                />
                                {/* Small Retail Orders: Muted Darker Blue Bars */}
                                <rect
                                    x={xSmall}
                                    y={paths.yScaleVolume(d.smallVolume)}
                                    width={barW}
                                    height={volumeHeight - paths.yScaleVolume(d.smallVolume)}
                                    fill="#6366f1"
                                />

                            </g>
                        );
                    })}
                    <text x={10} y={15} fill="#10b981" className="text-xs font-bold font-sans">Institutional Volume ({largeOrderThreshold.toFixed()})</text>
                    <text x={10} y={30} fill="#6366f1" className="text-xs font-bold font-sans">Retail Volume</text>


                </g>

                {/* PANEL 3: AGGRESSION DELTA OSCILLATOR (THE EXHAUSTION CENTER LINE) */}
                <g transform={`translate(${margin.left}, ${margin.top + priceHeight + volumeHeight + (gap * 2)})`}
                    style={{ transition: 'transform 0.3s ease-in-out' }} className='aggressionDelta'>
                    {/* Centered Baseline Horizon */}
                    <line x1={0} x2={width} y1={paths.yScaleDelta(0)} y2={paths.yScaleDelta(0)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,4" />

                    <g className='sweepIndicators' />
                    {/* Shaded Area Region Profiles */}
                    <path d={paths.deltaAreaAbove} fill="#10b981" opacity="0.15" />
                    <path d={paths.deltaAreaBelow} fill="#ef4444" opacity="0.15" />

                    {/* Core Trajectory Vector Line */}
                    <path d={paths.deltaLine} fill="none" stroke="#f97316" strokeWidth="2.5" />

                    <text x={10} y={15} fill="#f97316" className="text-xs font-bold font-sans">Order Aggression (Ask vs Bid)</text>
                </g>
            </svg>
        </div>
    );
}




























































//     return (
//         <div id='LargeOrderVisual' ref={orderSVGWrapper}>
//             <svg ref={orderSVG}>
//                 <g className='x-axis' />
//                 <g className='orderData' />
//             </svg>
//         </div>
//     )
// }

export default OrderSizeVisual