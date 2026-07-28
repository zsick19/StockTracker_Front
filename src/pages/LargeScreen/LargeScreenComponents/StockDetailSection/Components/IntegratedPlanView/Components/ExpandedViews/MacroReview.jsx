import React, { useMemo, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { selectPlanForStaticDetails, selectPlansMacroCorrelations } from '../../../../../../../../features/Engine/EnginePlanApiSlice'
import MacroChartWrapper from '../SubComponents/MacroChartWrapper'
import { sectorToTicker } from '../../../../../../../../Utilities/SectorsAndIndustries'

function MacroReview({ plan })
{
    const [selectedCorrelation, setSelectedCorrelation] = useState(0)
    const sectorTicker = sectorToTicker[plan.planConfig.sector]
    const industry = plan.stockInfo.Industry
    const correlation = plan.planConfig.correlationValues
    const strongestCorrelation = plan.planConfig.greatestCorrelation

    console.log(plan.planConfig)

    const beta = plan.planConfig.spyBetaValue || plan.stockInfo.Beta1Y || 1
    const sectorCorrelationValues = plan.planConfig.correlationValues.sector
    const strongestCorrelationValues = plan.planConfig.correlationValues[strongestCorrelation]
    const spyCorrelationValues = plan.planConfig.correlationValues.SPY

    const isHavenActive = strongestCorrelationValues.isCurrentlyDecoupled

    const correlationDeltaVelocity = spyCorrelationValues.correlation90Day - spyCorrelationValues.correlation30Day;
    const isActiveDecouplingImminent = correlationDeltaVelocity >= 0.25;

    const spyTranslation = translateCorrelationStrength(spyCorrelationValues.correlation90Day);

    const sectorTranslation = translateCorrelationStrength(sectorCorrelationValues.correlation90Day);
    const strongestTranslation = translateCorrelationStrength(strongestCorrelationValues.correlation90Day);
    const pivotTranslation = translatePivotVelocity(spyCorrelationValues.correlation90Day, spyCorrelationValues.correlation30Day);


    function provideCorrelationDescription()
    {
        switch (selectedCorrelation)
        {
            case 0: return <div>
                <p>SPY</p>
                <p>{spyTranslation.desc}</p>
            </div>
            case 1: return <div>SECTOR</div>
            case 2: return <div>STrongest</div>
        }
    }
    return (
        <div id='MacroReviewExpand'>
            <div id='MacroDualCharts'>
                <MacroChartWrapper macroTicker={sectorTicker} />

                <div style={{ fontSize: '10px', color: '#ffffff', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                    {/* SEGMENT A: CORE INDEX TRACKING PROFILE */}
                    <div>
                        <p>SPY</p>
                        <p style={{ color: `${spyTranslation.colorCode}` }}>{spyTranslation.label} ({(spyCorrelationValues.correlation90Day * 100).toFixed(0)}%)</p>
                        {/* <div>TACTICAL IMPLICATION: {spyTranslation.desc}</div> */}
                    </div>

                    <br />
                    {/* SEGMENT C: STRONGEST SINGLE COMPONENT BIAS VECTOR */}
                    <div>
                        <p>STRONGEST - {strongestCorrelation}</p>
                        <p style={{ color: `${strongestTranslation.colorCode}` }}>{strongestTranslation.label} ({(strongestCorrelationValues.correlation90Day * 100).toFixed(0)}%)</p>
                        {/* <div>TACTICAL IMPLICATION: {strongestTranslation.desc}</div> */}
                    </div>
                    <br />
                    {/* SEGMENT B: SECTOR MATRICES PROFILE */}
                    <div>
                        <p>SECTOR</p>
                        <p style={{ color: `${sectorTranslation.colorCode}` }}>{sectorTranslation.label} ({(sectorCorrelationValues.correlation90Day * 100).toFixed(0)}%)</p>
                        {/* <div>TACTICAL IMPLICATION: {sectorTranslation.desc}</div> */}
                    </div>

                    <br />

                    {/* SEGMENT D: LEADING VELOCITY PIVOT CALCULATOR [INDEX] */}
                    <div>
                        <p>MOMENTUM PIVOT SENTRY</p>
                        <p style={{ color: `${pivotTranslation.colorCode}` }}>{pivotTranslation.label}</p>
                        <br />
                        <p>TACTICAL IMPLICATION: {pivotTranslation.desc}</p>
                    </div>

                    {/* DECOUPLING VECTOR TIER */}
                    <div style={{ textAlign: 'center', width: '100%', borderTop: '1px solid #222', paddingTop: '8px' }}>
                        <div style={{ fontSize: '7px', color: '#6272a4', letterSpacing: '0.2px' }}>VECTOR STATE</div>
                        <div style={{
                            fontSize: '9px',
                            fontWeight: 'bold',
                            color: isHavenActive ? '#50fa7b' : '#ff5555',
                            marginTop: '4px',
                            textTransform: 'uppercase',
                            lineHeight: '1.1'
                        }}>
                            {isHavenActive ? "HAVEN" : "BOUND"}
                        </div>
                    </div>



                </div>
                <MacroChartWrapper macroTicker={strongestCorrelation} />
            </div>
            <div>

                <div>
                    <button onClick={() => setSelectedCorrelation(0)}>SPY</button>
                    <button onClick={() => setSelectedCorrelation(1)}>Sector</button>
                    <button onClick={() => setSelectedCorrelation(2)}>Strongest</button>
                </div>
                <div>
                    {provideCorrelationDescription()}
                </div>

            </div>
        </div >
    )
}

// =============================================================================
// 🧠 INTERNAL MICROSTRUCTURE TRANSLATION ROUTERS [INDEX]
// =============================================================================

/**
 * PRODUCTION COMPILER: translateCorrelationStrength
 * Parses direction and magnitude of multi-timeframe correlation coefficients 
 * to provide unambiguous, actionable takeaways for the live trading ledger [INDEX].
 * 
 * @param {number} rawCorrelationValue - Pearson correlation coefficient scalar from state (-1.0 to +1.0) [INDEX]
 * @returns {Object} Explicit text labels and tactical execution guidelines
 */
export const translateCorrelationStrength = (rawCorrelationValue) =>
{
    // 📐 PRECISE MAGNITUDE ANCHOR (THE COGNITIVE SHIELD)
    // Isolate the absolute strength value to filter tracking speed independent of direction [INDEX]
    const absoluteCorrelationStrength = Math.abs(rawCorrelationValue);
    const isDirectionPositive = rawCorrelationValue >= 0;

    // =========================================================================
    // 🧱 REGIME TIER 1: HIGH CONGRUENCE (THE INDEX LOCK) [INDEX]
    // =========================================================================
    if (absoluteCorrelationStrength >= 0.75)
    {
        return {
            label: isDirectionPositive ? 'HIGH CONGRUENCE' : 'HIGH INVERSE CONGRUENCE',
            isIndependent: false,
            colorCode: isDirectionPositive ? '#ff5555' : '#ffb86c', // Red alert for market dependencies, orange for inverse hedges
            desc: isDirectionPositive
                ? `This stock is highly synchronized with the index move. Do NOT open long positions if the market index is currently crashing.`
                : `This stock moves in strict opposition to the market index. Functions as an excellent structural hedge during index-level liquidations.`
        };
    }

    // =========================================================================
    // 🔄 REGIME TIER 2: MODERATE TRACKING (THE MIXED MOVER)
    // =========================================================================
    if (absoluteCorrelationStrength >= 0.40 && absoluteCorrelationStrength < 0.75)
    {
        return {
            label: isDirectionPositive ? 'MIXED TRACKING' : 'MIXED INVERSE',
            isIndependent: false,
            colorCode: '#6272a4', // Default slate-blue tone for neutral tracking regimes
            desc: isDirectionPositive
                ? `This stock generally drifts with its sector but retains a moderate amount of independent wiggling room.`
                : `This stock shows loose inverse tendencies. Operates mostly on its own tape with slight market index friction.`
        };
    }

    // =========================================================================
    // 🟢 REGIME TIER 3: THE DECOUPLED MATRIX (THE INDEPENDENT MOVER) [INDEX]
    // =========================================================================
    return {
        label: 'INDEPENDENT MOVER',
        isIndependent: true,
        colorCode: '#50fa7b', // Vibrant green signals a pure stock-picker environment [INDEX]
        desc: `This stock has broken away from the macro tide entirely. It completely ignores index-level trends and trades purely on its own individual volume and capital flows.`
    };
};



const translatePivotVelocity = (corr90, corr30) =>
{
    const delta = corr90 - corr30;
    if (delta >= 0.25) return { label: 'BULLISH ALPHA PIVOT', colorCode: '#01a830', desc: 'Short-term tracking has collapsed significantly beneath the macro baseline. Institutional rotation out of index funds and into this specific equity is actively occurring.' };
    if (delta <= -0.25) return { label: 'BEARISH LIQUIDITY CROWDING', colorCode: '#e01515', desc: 'Short-term tracking has spiked violently above long-term norms. Asset has lost its individual alpha and is being sucked into broad index liquidations.' };
    return {
        label: 'STABLE MOMENTUM CONVERGENCE', colorCode: '#535a55',
        desc: 'Short-term and long-term vectors are running in complete equilibrium. No systemic structural shifts detected.'
    };
};




export default MacroReview