import React from 'react';

export const CapitalAllocationMatrix = ({ planData, livePrice }) => {
    const channel = planData.channelPattern || {};
    const floor = channel.channelBottom || 100.00;
    const ceiling = channel.channelTop || 110.00;
    const bufferCeiling = channel.entryStrikeBuffer || 100.35;

    // Standard $1,000 capital baseline allocation layout math [INDEX]
    const principalAllocation = 1000;
    const sharesCount = principalAllocation / floor;
    
    // Profit target is the macro channel ceiling
    const grossDollarReward = (ceiling - floor) * sharesCount;
    const percentageRewardDelta = ((ceiling - floor) / floor) * 100;

    // Hard defensive risk is an estimated 2% protective stop buffer beneath your floor
    const hardStopLevel = floor * 0.98;
    const grossDollarRisk = (floor - hardStopLevel) * sharesCount;
    const rewardToRiskRatio = grossDollarReward / (grossDollarRisk || 1);

    // Verify if the active streaming session price sits inside your tick-aware entry box [INDEX]
    const isPriceInsideStrikeZone = livePrice >= floor && livePrice <= bufferCeiling;

    return (
        <div style={{ background: '#111219', padding: '20px', borderRadius: '4px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#50fa7b', fontSize: '11px', letterSpacing: '1px' }}>⚖️ CAPITAL POSITION SIZER ($1,000 PRINCIPAL)</h4>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isPriceInsideStrikeZone ? '#50fa7b' : '#ffea00' }}>
                    {isPriceInsideStrikeZone ? "📥 INSIDE EXECUTION BUY BOX" : "🔍 MONITORING: RADAR WATCH"}
                </span>
            </div>

            {/* THREE-TIER PRICING ROW HUD */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#090a0f', padding: '10px', borderRadius: '3px', border: '1px solid #1a1a24' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>MANUAL ENTRY FLOOR</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>${floor.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid #222', borderRight: '1px solid #222' }}>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>ZONE BUFFER LIMIT [INDEX]</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ffff' }}>${bufferCeiling.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>PROFIT CEILING BOUND</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>${ceiling.toFixed(2)}</div>
                </div>
            </div>

            {/* POSITION METRICS ALLOCATION GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '5px' }}>
                <div style={{ background: '#181922', padding: '10px', borderRadius: '3px', textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', color: '#6272a4', marginBottom: '2px' }}>TARGET SHARES ALLOCATION</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f1fa8c' }}>{sharesCount.toFixed(2)} <span style={{ fontSize: '10px', fontWeight: 'normal', color: '#6272a4' }}>SHARES</span></div>
                </div>
                
                <div style={{ background: '#181922', padding: '10px', borderRadius: '3px', textAlign: 'center', borderLeft: '2px solid #50fa7b' }}>
                    <div style={{ fontSize: '9px', color: '#6272a4', marginBottom: '2px' }}>GROSS DOLLAR REWARD</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#50fa7b' }}>+${grossDollarReward.toFixed(2)}</div>
                    <div style={{ fontSize: '9px', color: '#50fa7b' }}>({percentageRewardDelta.toFixed(1)}%)</div>
                </div>

                <div style={{ background: '#181922', padding: '10px', borderRadius: '3px', textAlign: 'center', borderLeft: '2px solid #ff5555' }}>
                    <div style={{ fontSize: '9px', color: '#6272a4', marginBottom: '2px' }}>MAX DOLLAR RISK (2% STOP)</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ff5555' }}>-${grossDollarRisk.toFixed(2)}</div>
                    <div style={{ fontSize: '9px', color: '#ff5555' }}>(-2.0%)</div>
                </div>
            </div>

            {/* ASYMMETRIC VERDICT FOOTER ANCHOR */}
            <div style={{ background: 'rgba(80,250,123,0.03)', padding: '10px', borderRadius: '3px', border: '1px dashed rgba(80,250,123,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ color: '#6272a4' }}>ASYMMETRIC ALPHA SCALE RATING:</span>
                <span style={{ fontWeight: 'bold', color: rewardToRiskRatio >= 3.0 ? '#50fa7b' : '#ffea00' }}>
                    {rewardToRiskRatio.toFixed(2)}x REWARD-TO-RISK MULTIPLIER {rewardToRiskRatio >= 3.0 ? "✅ (EXCEEDS 3:1 PRIME THRESHOLD)" : "⚠️ (TIGHT CORRIDOR)"}
                </span>
            </div>
        </div>
    );
};
