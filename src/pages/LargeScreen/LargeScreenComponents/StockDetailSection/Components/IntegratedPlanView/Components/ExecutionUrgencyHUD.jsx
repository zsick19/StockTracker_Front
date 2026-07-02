import { differenceInMinutes } from 'date-fns';
import React from 'react';

export const ExecutionUrgencyHud = ({ planData, currentSessionMinutesPostOpen }) =>
{
    const metadata = planData.metricConfig || {};
    const liveCandles = planData.todaysCandles || [];
    const activeCandle = liveCandles[liveCandles.length - 1] || {};

    const avgWindowMinutes = metadata.absorptionWindow.averageMinutesInStrikeZone || 15.0;
    const velocityProfile = metadata.absorptionWindow.executionVelocityRating || "STABLE_ACCUMULATION";


    // Evaluate if real-time 1-minute volume is spiking past your 3-day baseline [INDEX]
    const baselineOneMinVol = planData.planConfig.dailyCalculatedValues?.baselineAvgOneMinVolume || 5000;
    const isLiveVolumeClimax = activeCandle.Volume >= (baselineOneMinVol * 3.5);

    // console.log(activeCandle.Volume, baselineOneMinVol)


    // Track the time-of-day opening climax window (First 15 minutes of the bell) [INDEX]
    const isOpeningCrossActive = currentSessionMinutesPostOpen >= 0 && currentSessionMinutesPostOpen <= 15;

    return (
        <div style={{
            background: '#111219', padding: '10px',
            borderRadius: '4px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '12px'
        }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isLiveVolumeClimax && (
                    <span style={{ fontSize: '10px', background: 'rgba(0,255,255,0.1)', color: '#00ffff', borderRadius: '2px', fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
                        ⚡ LIQUIDITY ABSORPTION BLOCK ACTIVE
                    </span>)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {/* TIMEFRAME ABSORPTION CARD */}
                <div style={{ background: '#181922', padding: '12px', borderRadius: '3px', borderLeft: velocityProfile === "HYPER_VELOCITY_SPRING" ? '3px solid #ff5555' : '3px solid #50fa7b' }}>
                    <div style={{ fontSize: '10px', color: '#6272a4', marginBottom: '2px' }}>ABSORPTION WINDOW</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{avgWindowMinutes} <span style={{ fontSize: '12px', color: '#6272a4' }}>MIN</span></div>
                    <div style={{ fontSize: '9px', color: '#888', marginTop: '4px' }}>{velocityProfile.replace('_', ' ')}</div>
                </div>

                {/* AUCTION TIME PROFILE CARD */}
                <div style={{ background: '#181922', padding: '12px', borderRadius: '3px', borderLeft: isOpeningCrossActive ? '3px solid #ffb86c' : '3px solid #333' }}>
                    <div style={{ fontSize: '10px', color: '#6272a4', marginBottom: '2px' }}>SESSION TIMING</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: isOpeningCrossActive ? '#ffb86c' : '#fff', marginTop: '4px' }}>
                        {isOpeningCrossActive ? "OPENING AUCTION CROSS" : "MIDDAY CHURN"}
                    </div>
                    <div style={{ fontSize: '9px', color: '#888', marginTop: '8px' }}>
                        {isOpeningCrossActive ? "High probability reversal node active." : "Volume velocity is currently relaxed."}
                    </div>
                </div>
            </div>

            
        </div>
    );
};
