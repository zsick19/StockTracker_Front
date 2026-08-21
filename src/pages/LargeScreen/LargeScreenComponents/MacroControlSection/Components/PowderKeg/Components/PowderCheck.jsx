import { Circle } from 'lucide-react'
import React from 'react'

function PowderCheck({ stockInfo })
{
    // console.log(stockInfo)
    return (
        <div style={{ fontSize: '10px' }}>
            <div className='flex'>
                <div>

                    <div className='flex'>
                        <Circle fill={stockInfo.ShortPercentOfFloat > 20 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Short % of Float</p>
                    </div>
                    <div className='flex'>
                        <Circle fill={stockInfo.ShortPercentOfShares > 20 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Short % of Shares</p>
                    </div>
                    <div className='flex'>
                        <Circle fill={stockInfo.ShortRatioDaysToCover > 4 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Days To Cover</p>
                    </div>
                </div>
                <div>
                    <div className='flex'>
                        <Circle fill={stockInfo.SharesFloat < 200000000 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Float</p>
                    </div>
                    <div className='flex'>
                        <Circle fill={stockInfo.MarketCap < 500000000 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Market Cap</p>
                    </div>
                    <div className='flex'>
                        <Circle fill={stockInfo.FloatPercent < 50 ? 'yellowGreen' : 'red'} color='' size='14' />
                        <p>Float %</p>
                    </div>
                </div>
            </div>

        </div>

    )
}

export default PowderCheck