import React, { useState } from 'react'
import { useGetUsersAccountBalanceQuery } from '../../../../../../../features/AccountBalance/AccountBalanceApiSlice'

function CompanyInfo({ selectedStock, setShowSupportingTickers })
{
    const { data, isLoading, isSuccess, isError, error } = useGetUsersAccountBalanceQuery()

    return (
        <div id='CompanyInformation'>
            {(isSuccess && selectedStock) ?
                selectedStock?.currentRiskVReward.risk >= data.maxLossPerTradePercent ?
                    <div className='flex'>
                        <div>
                            <h2>Wait For A Better Price</h2>
                            <p>Plan risk of {selectedStock.currentRiskVReward.risk.toFixed(2)}% exceeds max risk of {data.maxLossPerTradePercent}%.</p>
                        </div>
                        <div>
                            <h2>{(data.maxLossPerTradeDollar / (selectedStock.mostRecentPrice * (selectedStock.currentRiskVReward.risk / 100))).toFixed()} Shares</h2>
                            <p>
                                To cap losses to only ${data.maxLossPerTradeDollar} at current risk</p>
                            <p>Absolute Stoploss: ${(selectedStock.mostRecentPrice - (selectedStock.mostRecentPrice * (data.maxLossPerTradePercent / 100))).toFixed(2)}</p>
                        </div>
                    </div> :

                    <div className='flex'>
                        <div>
                            <h2>Entry Looks Good</h2>
                            <p>Plan risk of {selectedStock?.currentRiskVReward.risk.toFixed(2)}% is lower than max loss risk of {data.maxLossPerTradePercent}%.</p>
                        </div>

                        <div>
                            <h2>{(data.maxLossPerTradeDollar / (selectedStock?.mostRecentPrice * (data.maxLossPerTradePercent / 100))).toFixed()} Shares</h2>
                            <p>Using Max Loss of ${data.maxLossPerTradeDollar}</p>
                            <p>Absolute Stoploss: ${(selectedStock?.mostRecentPrice - (selectedStock?.mostRecentPrice * (data.maxLossPerTradePercent / 100))).toFixed(2)}</p>
                        </div>
                        <br />
                        <div>
                            <h2>{(data.maxLossPerTradeDollar / (selectedStock?.mostRecentPrice * (selectedStock?.currentRiskVReward.risk / 100))).toFixed()} Shares</h2>
                            <p>Using Trading Plan Exit</p>
                        </div>

                    </div>
                : <div>
                    <button>Reload Max Loss Info</button>
                </div>
            }



        </div>
    )
}

export default CompanyInfo