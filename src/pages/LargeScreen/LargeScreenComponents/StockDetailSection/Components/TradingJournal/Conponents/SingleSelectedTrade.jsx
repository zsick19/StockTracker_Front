import { differenceInDays } from 'date-fns';
import React from 'react'

function SingleSelectedTrade({ trade, selectedTrade, setSelectedTrade, setShowSelectedTradeOrStats })
{

    const enterNumeric = new Date(trade.enterDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    const exitNumeric = new Date(trade.exitDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
    const holdPeriod = differenceInDays(trade.exitDate, trade.enterDate)
    const riskRewardIdeal = {
        risk: (trade.tradingPlanPrices[1] - trade.tradingPlanPrices[0]).toFixed(2),
        reward: (trade.tradingPlanPrices[4] - trade.tradingPlanPrices[1]).toFixed(2),
        actualReward: (trade.averageSellPrice - trade.tradingPlanPrices[1]).toFixed(2)
    }
    return (
        <div className={`${selectedTrade?.tickerSymbol === trade.tickerSymbol ? 'selectedTradeHighLite' : ''} singleTradeResult`} onClick={() => { setSelectedTrade(trade); setShowSelectedTradeOrStats(true) }}>
            <p>{trade.tickerSymbol}</p>
            <p>{trade.sector}</p>
            <div>
                <p>{enterNumeric} - {exitNumeric}</p>
                <p>{holdPeriod} day hold</p>
            </div>
            <div>
                <p>${trade?.averagePurchasePrice}</p>
                <p>${trade?.averageSellPrice}</p>
            </div>
            <div>
                <p>Reward: {riskRewardIdeal.actualReward}</p>
                <p>{riskRewardIdeal.risk} vs {riskRewardIdeal.reward}</p>
            </div>

            <p>+{trade?.exitGainPercent}%</p>
            <p>{trade?.exitMovePercent}%</p>
            <div>
                <p>${trade?.exitGain}</p>
                <p>{trade.availableShares} Shares</p>
            </div>
        </div>
    )
}

export default SingleSelectedTrade