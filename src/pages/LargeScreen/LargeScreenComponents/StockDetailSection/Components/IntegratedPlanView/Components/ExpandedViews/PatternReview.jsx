import React from 'react'

function PatternReview({ plan })
{
    const planConfig = plan.planConfig
    const patternConfig = plan.patternConfig


    const riskRewardSpread = { risk: patternConfig.entryStrikeBuffer - planConfig.plan.stopLossPrice, reward: patternConfig.channelTop - patternConfig.entryStrikeBuffer }
    const idealRisk = ((riskRewardSpread.risk) / patternConfig.entryStrikeBuffer) * 100
    const idealReward = ((riskRewardSpread.reward) / patternConfig.entryStrikeBuffer) * 100
    const sharesWith1000 = Math.floor(1000 / patternConfig.entryStrikeBuffer)



    return (
        <div id='PatternReviewExpanded'>
            <p>Tracking for: {planConfig.trackingDays} Days</p>
            <p>RSI:{planConfig.dailyCalculatedValues.rsi}</p>
            <p>ATR:{planConfig.dailyCalculatedValues.atr}</p>

            <p>Pattern Relevant Date: {planConfig.relevantCandleDate}</p>
            <p>Requires 1 Min Candles: {patternConfig.maintainLiveCandles ? 'yes' : 'no'}</p>

            <br />
            <p>Pattern Type: {patternConfig.patternClassification}</p>
            {patternConfig.patternClassification === 'channel' &&
                <div>
                    <p>Channel Type:{patternConfig.channelType}</p>
                    <p>Anchor Date: {patternConfig.anchorDate}</p>

                    <br />
                    <div className='flex'>
                        <p>Channel Bottom: {patternConfig.channelBottom}</p>
                        <p>Channel Top: {patternConfig.channelTop}</p>
                        <p>Channel Height: {patternConfig.channelHeight}</p>
                        <p>Strike Price: {patternConfig.entryStrikeBuffer}</p>
                        <p>Stoploss Price: {planConfig.plan.stopLossPrice}</p>
                    </div>

                    <br />
                    <p>Ideal RvR</p>
                    <div className='flex'>
                        <p>Risk: {idealRisk.toFixed(2)}%  -${(sharesWith1000 * riskRewardSpread.risk).toFixed(2)}</p>
                        <p>Reward: {idealReward.toFixed(2)}% ${(sharesWith1000 * riskRewardSpread.reward).toFixed(2)}</p>
                        <p>{(idealReward / idealRisk).toFixed(2)}x risk to reward ratio</p>
                    </div>
                </div>
            }
            <br />

        //average number of down days before a reversal
        //yesterday candle info


        </div>
    )
}

export default PatternReview