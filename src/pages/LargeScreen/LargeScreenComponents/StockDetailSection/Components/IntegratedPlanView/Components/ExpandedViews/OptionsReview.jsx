import React from 'react'

/**
 * PRODUCTION COMPONENT: OptionsWorkspaceDashboard
 * Ingests your MongoDB options expected moves schema data and pre-allocates a clean,
 * institutional-grade layout for live Alpaca derivatives streams [INDEX].
*/
function OptionsReview({ plan, livePrice = 2.95 })
{

    // const callWall = optionsInfo.weekly.callWall !== 0 ? optionsInfo.weekly.callWall : optionsInfo.monthly.callWall
    // const putWall = optionsInfo.weekly.putWall !== 0 ? optionsInfo.weekly.putWall : optionsInfo.monthly.putWall
    // const putCallRatio = optionsInfo.weekly.putWall !== 0 ? optionsInfo.weekly.putCallRatio : optionsInfo.monthly.putCallRatio
    // const lowerEM = optionsInfo.weekly.putWall !== 0 ? optionsInfo.weekly.lowerExpectedBounds : optionsInfo.monthly.lowerExpectedBounds
    // const upperEM = optionsInfo.weekly.putWall !== 0 ? optionsInfo.weekly.upperExpectedBounds : optionsInfo.monthly.upperExpectedBounds
    // console.log(optionsInfo)
    // const metaData = optionsInfo.metadata

    // // metadata: {
    // //   targetExpirationDate: '2026-07-10',
    // //   daysRemainingToExpiration: 2,
    // //   isExpirationImminent: true,
    // //   lastReCalibratedTimestamp: '2026-07-08T13:26:00.317Z'
    // // }

    // return (
    //     <div>
    //         {/* <p>Plan Has Options</p>
    //         <p>Call Wall: {callWall}</p>
    //         <p>Put Wall: {putWall}</p>
    //         <p>Put/Call Ratio: {putCallRatio}</p>
    //         <p>Lower Expected Move:{lowerEM}</p>
    //         <p>Upper Expected Move:{upperEM}</p>
    //         <p>{metaData.targetExpirationDate}</p> */}
    //     </div>
    // )



    const optionsData = plan.optionsConfig || {};
    const hasOptionsFlag = plan.stockInfo.HasOptions !== false;
    if (!optionsData) return <div>Plan Has No Options</div>


    const weeklyMetrics = optionsData.weekly.putWall === 0 ? { ...optionsData.monthly, isMonthly: true } : { ...optionsData.weekly, isMonthly: false }
    const targetExpirationStr = optionsData.metadata?.targetExpirationDate || "2026-07-10";

    // Local price mapping variables to generate real-time execution proximity badges [INDEX]
    const isPriceAtPutWall = Math.abs(livePrice - weeklyMetrics.putWall) / weeklyMetrics.putWall <= 0.0035;
    const isPriceAtLowerBound = Math.abs(livePrice - weeklyMetrics.lowerExpectedMoveBound) / weeklyMetrics.lowerExpectedMoveBound <= 0.0015;

    // Placeholder data mapping matrix for your upcoming Alpaca options chain integration [INDEX]
    const placeholderOptionsChainData = [
        // { strike: 2.50, callBid: 0.45, callAsk: 0.48, callOI: 120, putBid: 0.01, putAsk: 0.03, putOI: 4500 },
        // { strike: 3.00, callBid: 0.12, callAsk: 0.14, callOI: 8500, putBid: 0.14, putAsk: 0.16, putOI: 9200 },
        // { strike: 3.50, callBid: 0.02, callAsk: 0.04, callOI: 6200, putBid: 0.55, putAsk: 0.60, putOI: 140 }
    ];

    return (
        <div style={{ background: '#0c0d12', color: '#fff', fontFamily: 'monospace', padding: '20px', borderRadius: '4px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* 📋 SECTION 1: HEADER TELEMETRY TRACKER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111219', padding: '12px 20px', borderRadius: '4px', border: '1px solid #222' }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#6272a4', letterSpacing: '1px' }}>DERIVATIVES CHAIN EXPIRATION TARGET</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '3px' }}>
                        📅 {targetExpirationStr} <span style={{ fontSize: '11px', color: '#6272a4', fontWeight: 'normal' }}>{weeklyMetrics.isMonthly ? "(Monthly Cycle)" : "(Weekly Cycle)"}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', background: hasOptionsFlag ? 'rgba(80,250,123,0.1)' : 'rgba(255,85,85,0.1)', color: hasOptionsFlag ? '#50fa7b' : '#ff5555', padding: '4px 10px', borderRadius: '2px', fontWeight: 'bold', border: hasOptionsFlag ? '1px solid rgba(80,250,123,0.2)' : '1px solid rgba(255,85,85,0.2)' }}>
                        {hasOptionsFlag ? "⛓️ OPTIONS CHAIN LIQUIDITY VALID" : "❌ NON-OPTIONABLE STRUCTURE"}
                    </span>
                </div>
            </div>

            {/* ⚖️ SECTION 2: INSTITUTIONAL BOUNDARY CODES LAYER GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>

                {/* ELEMENT A: HEDGING WALL CODES */}
                <div style={{ background: '#111219', padding: '14px', borderRadius: '4px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#6272a4', fontWeight: 'bold' }}>🏛️ INSTITUTIONAL POSITION WALLS</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid #1e1f29', paddingBottom: '4px' }}>
                        <span style={{ color: '#ff5555' }}>PUT WALL FLOOR:</span>
                        <span style={{ fontWeight: 'bold', color: isPriceAtPutWall ? '#ffea00' : '#fff' }}>${weeklyMetrics.putWall.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#50fa7b' }}>CALL WALL CEILING:</span>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>${weeklyMetrics.callWall.toFixed(2)}</span>
                    </div>
                </div>

                {/* ELEMENT B: VOLATILITY STANDARD DEVIATION RUNWAYS [INDEX] */}
                <div style={{ background: '#111219', padding: '14px', borderRadius: '4px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#6272a4', fontWeight: 'bold' }}>🌊 IMPLIED VOLATILITY BOUNDS (1-SD)</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid #1e1f29', paddingBottom: '4px' }}>
                        <span style={{ color: '#ffb86c' }}>LOWER EXPECTED MOVE:</span>
                        <span style={{ fontWeight: 'bold', color: isPriceAtLowerBound ? '#00ffff' : '#fff' }}>${weeklyMetrics?.lowerExpectedBounds?.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#ffb86c' }}>UPPER EXPECTED MOVE:</span>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>${weeklyMetrics.upperExpectedBounds?.toFixed(2)}</span>
                    </div>
                </div>

                {/* ELEMENT C: BREADTH BALANCE MATRIX */}
                <div style={{ background: '#111219', padding: '14px', borderRadius: '4px', border: '1px solid #222', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '10px', color: '#6272a4', fontWeight: 'bold' }}>📊 PUT/CALL OPEN INTEREST RATIO</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f1fa8c', fontFamily: 'monospace', marginTop: '2px' }}>
                        {weeklyMetrics.putCallRatio.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '9px', color: '#888', textAlign: 'center' }}>
                        {weeklyMetrics.putCallRatio <= 0.40 ? "🔥 EXTREME INSTITUTIONAL BULL SKEW" : "STANDARD CORRIDOR"}
                    </div>
                </div>

            </div>

            {/* 🗺️ SECTION 3: THE LIVE RE-ENTRY ABSORPTION MATRIX ALERTS */}
            {(isPriceAtPutWall || isPriceAtLowerBound) && (
                <div style={{ background: 'rgba(0,255,255,0.04)', border: '1px dashed #00ffff', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center', color: '#00ffff' }}>
                    ⚡ SENTRY GATE ALERT: Asset price has locked inside an institutional derivatives protection fence. Market-maker short gamma hedging loops are active [INDEX].
                </div>
            )}

            {/* 🗂️ SECTION 4: INTRADAY OPTIONS CHAIN PRE-ALLOCATION LAYER MATRIX (WITH PLACEHOLDERS) [INDEX] */}
            <div style={{ flex: '1', background: '#111219', borderRadius: '4px', border: '1px solid #222', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* LABELED MATRIX HEADER ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 20px', background: '#0e0f15', borderBottom: '1px solid #222', fontSize: '10px', color: '#6272a4', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
                    <div style={{ textAlign: 'left' }}>📥 CALL MATRIX (OPEN INTEREST / MARKET SKEW)</div>
                    <div>STRIKE PRICE BOUNDARY</div>
                    <div style={{ textAlign: 'right' }}>PUT MATRIX (OPEN INTEREST) 📤</div>
                </div>

                {/* INTERACTIVE ROWS SCROLLING RAIL CONTAINER */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '250px', overflowY: 'scroll' }} className=''>

                    {placeholderOptionsChainData.map((row, index) =>
                    {
                        // Highlight rows if they coalign directly with your structural system walls [INDEX]
                        const isStrikeAWallCoordinate = row.strike === weeklyMetrics.putWall || row.strike === weeklyMetrics.callWall;

                        return (
                            <div key={row.strike} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid #1a1b26', background: isStrikeAWallCoordinate ? 'rgba(255,184,108,0.02)' : (index % 2 === 0 ? '#141520' : '#111219'), fontSize: '11px', transition: 'background 0.2s ease', alignItems: 'center' }}>

                                {/* CALL DATA BLOCK */}
                                <div style={{ display: 'flex', gap: '15px', color: '#888' }}>
                                    <span style={{ color: '#50fa7b', fontWeight: 'bold' }}>OI: {row.callOI.toLocaleString()}</span>
                                    <span>B: ${row.callBid.toFixed(2)}</span>
                                    <span>A: ${row.callAsk.toFixed(2)}</span>
                                </div>

                                {/* CENTER AXIS STRIKE PILL CONTAINER */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ background: isStrikeAWallCoordinate ? '#ffb86c' : '#21222c', color: isStrikeAWallCoordinate ? '#000' : '#fff', padding: '3px 12px', borderRadius: '3px', fontWeight: 'bold', display: 'inline-block', minWidth: '50px', textAlign: 'center', border: isStrikeAWallCoordinate ? '1px solid #ffb86c' : '1px solid #333' }}>
                                        ${row.strike.toFixed(2)}
                                    </span>
                                </div>
                                {/* PUT DATA BLOCK */}
                                <div style={{ display: 'flex', gap: '15px', color: '#888', justifyContent: 'flex-end', gridColumn: '4' }}>
                                    B: ${row.putBid.toFixed(2)}
                                    A: ${row.putAsk.toFixed(2)}
                                    <span style={{ color: '#ff5555', fontWeight: 'bold' }}>
                                        OI: {row.putOI.toLocaleString()}
                                    </span>
                                </div>
                                {/* LIVE ALPA FEED INTEGRATION NOTIFIER ANCHOR FOOTER */}
                                {/* <div style={{ padding: '20px', textAlign: 'center', fontSize: '10px', color: '#44475a', borderStyle: 'dashed', borderWidth: '1px 0 0 0', borderColor: '#222', marginTop: 'auto', background: '#0e0f15' }}>
                                    🛰️ LIVE WIRE STANDBY: Options chain grid pre-allocated.
                                </div> */}
                                {/* Wire useGetAlpacaLiveOptionsChainQuery(Symbol) to this layout layer container to stream live multi-tier contract deltas [INDEX].  */}
                            </div>
                        )
                    })}

                </div>

            </div>
        </div >
    )
}

export default OptionsReview
