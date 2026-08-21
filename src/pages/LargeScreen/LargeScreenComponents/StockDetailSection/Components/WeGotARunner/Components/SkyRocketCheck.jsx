import { Circle } from 'lucide-react'
import React, { useMemo } from 'react'
import { abbreviateNumber, marketCapToText } from '../../../../../../../Utilities/UtilityHelperFunctions'
import { makeSelectNewsRunnerStockInfoById, selectLargeOrderThresholdById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import { useSelector } from 'react-redux'

function SkyRocketCheck({ ticker })
{
    const stockInfo = useSelector((state) => makeSelectNewsRunnerStockInfoById(state, ticker))
    if (!stockInfo) return <div>No Info Yet</div>

    return (
        <div style={{ fontSize: '12px', display: 'grid', justifyContent: 'center' }}>
            <div className='flex'>
                <div>
                    <div className='flex'>
                        <Circle fill={stockInfo.ShortPercentOfFloat > 20 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Short % of Float ({stockInfo.ShortPercentOfFloat}%)</p>
                    </div>
                    <div className='flex'>
                        <Circle fill={stockInfo.ShortPercentOfShares > 20 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Short % of Shares ({stockInfo.ShortPercentOfShares}%)</p>
                    </div>
                    <div className='flex'>
                        <Circle fill={stockInfo.ShortRatioDaysToCover > 4 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Days To Cover ({stockInfo.ShortRatioDaysToCover} days)</p>
                    </div>
                </div>
                <div>
                    <div className='flex'>
                        <Circle fill={stockInfo.SharesFloat < 200000000 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Float - {abbreviateNumber(stockInfo.SharesFloat)}</p>
                    </div>
                    <div className='flex'>
                        <Circle fill={stockInfo.MarketCap < 500000000 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>{marketCapToText(stockInfo.MarketCap)}</p>
                    </div>
                    <div className='flex'>
                        <Circle fill={stockInfo.FloatPercentage < 50 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Float - {stockInfo.FloatPercentage}%</p>
                    </div>
                </div>
            </div>
            <br />
            <div className='flex'>
                <div className='flex'>
                    <Circle fill={(stockInfo.PositionInRangePercent < 25 || stockInfo.PositionInRangePercent > 90) ? 'yellowGreen' : 'red'} size='14' color='' />
                    <p>Position In Range ({stockInfo.PositionInRangePercent})</p>
                </div>
                <div className='flex'>
                    <Circle fill={(stockInfo.Beta1Y > 2) ? 'yellowGreen' : 'red'} color='' size='14' />
                    <p>Beta1Y ({stockInfo.Beta1Y})</p>
                </div>
            </div>
        </div>
    )
}

export default SkyRocketCheck