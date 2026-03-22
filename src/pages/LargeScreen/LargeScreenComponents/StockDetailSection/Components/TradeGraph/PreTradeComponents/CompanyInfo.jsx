import React, { useState } from 'react'

function CompanyInfo({ selectedStock, setShowSupportingTickers })
{

    const [maxLossPercent, setMaxLossPercent] = useState(2.5)
    const [maxLossAmountPerTrade, setMaxLossAmountPerTrade] = useState(50)

    return (
        <div id='CompanyInformation'>
            <div className='flex'>
                <label>Max Loss Percent:</label >
                <input type="number" min={1} max={5} step={0.5} onChange={(e) => setMaxLossPercent(parseFloat(e.target.value))} value={maxLossPercent} />
            </div>
            <div className='flex'>
                <label>Max Loss Amount:</label >
                <input type="number" min={0} onChange={(e) => setMaxLossAmountPerTrade(parseFloat(e.target.value))} value={maxLossAmountPerTrade} />
            </div>



            {selectedStock.currentRiskVReward.risk > maxLossPercent ?
                <div>
                    <p>Wait for price to come down for a better Trade.</p>
                    <p>Current priced risk of {selectedStock.currentRiskVReward.risk.toFixed(2)}% exceeds max risk per trade of {maxLossPercent}%.</p>
                    <p>To cap losses to only $50 use a position size of: {(maxLossAmountPerTrade / (selectedStock.mostRecentPrice * selectedStock.currentRiskVReward.risk / 100)).toFixed()}</p>
                </div> :
                <p>
                    <p>Following the trading plan</p>
                    <p>Current priced risk of {selectedStock.currentRiskVReward.risk.toFixed(2)}% is lower than the max loss risk of {maxLossPercent}%.</p>
                    <p>Suggested Position Size at Max Loss Per Trade Percent: {(maxLossAmountPerTrade / (selectedStock.mostRecentPrice * (maxLossPercent / 100))).toFixed()} </p>
                    <p>Suggest Position Size if following Risk Exit: {(maxLossAmountPerTrade / (selectedStock.mostRecentPrice * selectedStock.currentRiskVReward.risk / 100)).toFixed()}</p>
                </p>
            }




        </div>
    )
}

export default CompanyInfo