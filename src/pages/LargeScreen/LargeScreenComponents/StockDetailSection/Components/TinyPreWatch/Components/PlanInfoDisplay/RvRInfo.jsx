import React from 'react'

function RvRInfo({ plan })
{
    return (
        <div>
            <p>Risk To Reward</p>
            <div className='flex'>
                <div className='flex'>
                    <div>
                        <p>Ideal Risk: {plan.plan.percents[0]}%</p>
                        <p>$1000 Loss: {plan.with1000DollarsCurrentRisk.toFixed(2)}</p>
                    </div>
                    <div>
                        <p>Ideal Reward: {plan.plan.percents[3]}%</p>
                        <p>$1000 Gain: {plan.with1000DollarsIdealGain.toFixed(2)}</p>
                    </div>
                </div>
                <br />
                <div className='flex'>
                    <div>
                        <p>Current Risk: {plan.currentRiskVReward.risk.toFixed(2)}%</p>
                        <p>$1000 Loss: {plan.with1000DollarsCurrentRisk.toFixed(2)}</p>
                    </div>
                    <div>
                        <p>Current Reward: {plan.currentRiskVReward.reward.toFixed(2)}%</p>
                        <p>$1000 Gain: {plan.with1000DollarsCurrentGain.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RvRInfo