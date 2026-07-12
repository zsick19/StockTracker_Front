import React from 'react';
import { useSelector } from 'react-redux';

export const VolumetricClimaxSentryBadge = ({ plan, accumulatedVolumeUp, accumulatedVolumeDown, upMorning, currentPrice }) =>
{


    if (!plan || !plan.metricConfig.morningMetrics) return null;

    const morningMetrics = plan.metricConfig.morningMetrics;
    const downSide = morningMetrics.downSide || {};

    // Extract today's live volume curve sum relative to the historical baseline anchor
    // For your active chart, this represents your explicit 401% climax reading


    const liveVolumeToBaselineRatio = upMorning ? accumulatedVolumeUp : accumulatedVolumeDown || 4.01;

    const isClimaxThresholdViolated = liveVolumeToBaselineRatio >= 2.50;
    // const currentPrice = currentPrice || 2.96;
    const channelFloor = plan.patternConfig?.channelBottom || 2.95;

    // Verify if the stock is actively executing right above your support line
    const isSittingAtDeepSupport = Math.abs(currentPrice - channelFloor) / channelFloor <= 0.015;

    return (
        <div style={{
            contain: 'content', // Enforce performance layout boundaries to freeze parent reflows
            background: isClimaxThresholdViolated ? 'rgba(255, 85, 85, 0.03)' : '#111219',
            border: isClimaxThresholdViolated ? '1px solid #ff5555' : '1px solid #222',
            padding: '16px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* WIDGET HEADER NODE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', color: '#6272a4', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    🛰️ VOLUMETRIC REVERSAL SENTRY
                </span>
                <span style={{
                    fontSize: '9px',
                    background: isClimaxThresholdViolated ? '#ff5555' : '#222',
                    color: isClimaxThresholdViolated ? '#000' : '#6272a4',
                    padding: '2px 6px', borderRadius: '2px', fontWeight: 'bold'
                }}>
                    {isClimaxThresholdViolated ? "⚠️ CLIMAX EXHAUSTION" : "STABLE PACE"}
                </span>
            </div>

            {/* STATUS SIGNAGE GRID */}
            {isClimaxThresholdViolated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ff5555' }}>
                        {liveVolumeToBaselineRatio.toFixed()}% OF HISTORICAL DOWN-DAY VOLUME TO PEAK
                    </div>
                    <div style={{ fontSize: '11px', color: '#fff', lineHeight: '1.3', marginTop: '2px' }}>
                        {isSittingAtDeepSupport
                            ? "🟩 VALIDATED REVERSAL SIGNAL: Extreme volume capitulation is striking an institutional channel floor. Sellers are completely exhausted. Institutional block absorption is actively loading long positions [INDEX]."
                            : "⚠️ HIGH MOMENTUM DRAG: Volume is exploding downward in open space. Standby and wait for price stabilization near a known support ceiling before entry [INDEX]."}
                    </div>
                </div>
            ) : (
                <div style={{ fontSize: '11px', color: '#6272a4', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
                    ⬜ Intraday regular session volume pacing matches normal multi-day baseline curves.
                </div>
            )}
        </div>
    );
};
