import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { enterBufferSelectors, enterExitPlannedSelectors, fiveMinSelectors, highImportanceSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import MiniFiveMinChart from './MiniFiveMinChart'

function SingleTinyPreWatch({ id, watchList })
{
    const tickerData = useSelector(state => fiveMinSelectors.selectById(state, id))
    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })
    function provideSelector(data)
    {
        switch (watchList)
        {
            case 'enterBufferHit': return enterBufferSelectors.selectById(data.enterBufferHit, id)
            case 'stopLossHit': return stopLossHitSelectors.selectById(data.stopLossHit, id)
            case 'highImportance': return highImportanceSelectors.selectById(data.highImportance, id)
            case 'plannedTickers': return enterExitPlannedSelectors.selectById(data.plannedTickers, id)
        }
    }

    const [flashNewPrice, setFlashNewPrice] = useState(false)
    useEffect(() =>
    {
        setFlashNewPrice(true)
        setTimeout(() => setFlashNewPrice(false), [1500])
    }, [plan?.mostRecentPrice])

    let direction = plan?.todayOpenPrice < plan?.mostRecentPrice
    
    return (
        <div className='singleTinyPreWatch'>
            <div>
                <h3>{id}</h3>
                <p>{plan?.sector}</p>
            </div>
            <MiniFiveMinChart candleData={tickerData.candleData} openPrice={plan?.todayOpenPrice} direction={direction} enterPrice={plan?.plan.enterPrice} />

            <div className={`${direction ? 'positiveDay' : 'negativeDay'} tinyPriceInfo`}>
                <h3 className={`${flashNewPrice ? 'newIncomingPrice' : ''}`}>{plan?.mostRecentPrice.toFixed(2)}</h3>
                <div className='flex'>
                    <p>{plan?.changeFromYesterdayClose.toFixed(2)}</p>
                    <p>{plan?.currentDayPercentGain.toFixed(2)}%</p>
                </div>
            </div>
        </div>
    )
}

export default SingleTinyPreWatch