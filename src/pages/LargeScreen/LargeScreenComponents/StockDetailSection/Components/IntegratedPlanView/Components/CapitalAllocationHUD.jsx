import React, { useState } from 'react';

export const CapitalAllocationHUD = ({ planData, mostRecentPrice }) =>
{
    const channel = planData.patternConfig || {};
    const floor = channel.channelBottom || 100.00;
    const ceiling = channel.channelTop || 110.00;
    const bufferCeiling = channel.entryStrikeBuffer || 100.35;

    const stopLossPrice = planData.planConfig.plan.stopLossPrice

    const principalAllocation = 1000;
    const sharesCount = principalAllocation / floor;

    const grossDollarReward = (ceiling - floor) * sharesCount;
    const percentageRewardDelta = ((ceiling - floor) / floor) * 100;

    const floorRiskPercent = ((floor - stopLossPrice) / floor) * 100
    const grossDollarRisk = (floor - stopLossPrice) * sharesCount;
    const rewardToRiskRatio = grossDollarReward / (grossDollarRisk || 1);


    const currentNumberOfShares = Math.floor(1000 / mostRecentPrice)
    const currentRewardSpread = ceiling - mostRecentPrice
    const currentReward = currentRewardSpread * currentNumberOfShares

    const currentRiskSpread = mostRecentPrice - stopLossPrice
    const currentRisk = currentRiskSpread * currentNumberOfShares
    const currentRewardToRiskRatio = currentReward / currentRisk

    return (
        <div style={{ background: '#111219', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', textAlign: 'center', gap: '2rem' }}>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #222' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#c70000' }}>${stopLossPrice.toFixed(2)}</div>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>STOP LOSS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ffff' }}>${floor.toFixed(2)}</div>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>FLOOR</div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid #222' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ffff' }}>${bufferCeiling.toFixed(2)}</div>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>ENTRY</div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid #222' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1ff029' }}>${ceiling.toFixed(2)}</div>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>EXIT</div>
                </div>
            </div>

            <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ textAlign: 'center', borderRight: '1px solid #222' }}>
                        <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#c70000' }}>${currentRisk.toFixed(2)} <span style={{ fontSize: '9px' }}> {floorRiskPercent.toFixed(2)}%</span>                        </p>
                        <div style={{ fontSize: '9px', color: '#6272a4' }}>CURRENT RISK</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#50fa7b' }}>${currentReward.toFixed(2)} <span style={{ fontSize: '9px' }}> {percentageRewardDelta.toFixed(1)}%</span></p>
                        <div style={{ fontSize: '9px', color: '#6272a4' }}>CURRENT REWARD</div>
                    </div>
                </div>

                <div style={{
                    background: 'rgba(80,250,123,0.03)', borderRadius: '3px',
                    marginTop: '10px',
                    border: '1px dashed rgba(80,250,123,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px'
                }}>
                    <span style={{ fontSize: '12px', color: currentRewardToRiskRatio >= 3.0 ? '#50fa7b' : '#ffea00' }}>
                        {currentRewardToRiskRatio >= 3.0 ? "✅" : "⚠️"} {currentRewardToRiskRatio.toFixed(2)}x CURRENT RvR RATIO
                    </span>
                </div>
            </div>

            {/* 
            <h3>Plan</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #222' }}>
                    <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#c70000' }}>${grossDollarRisk.toFixed(2)} <span style={{ fontSize: '9px' }}> {floorRiskPercent.toFixed(2)}%</span>                        </p>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>PLAN RISK</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#50fa7b' }}>${grossDollarReward.toFixed(2)} <span style={{ fontSize: '9px' }}> {percentageRewardDelta.toFixed(1)}%</span></p>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>PLAN REWARD</div>
                </div>
            </div>



            <div style={{ background: 'rgba(80,250,123,0.03)', borderRadius: '3px', border: '1px dashed rgba(80,250,123,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ fontWeight: 'bold', color: rewardToRiskRatio >= 3.0 ? '#50fa7b' : '#ffea00' }}>
                    {rewardToRiskRatio >= 3.0 ? "✅" : "⚠️"} {rewardToRiskRatio.toFixed(2)}x RISK TO REWARD RATIO
                </span>
            </div> */}



        </div >
    );
};
