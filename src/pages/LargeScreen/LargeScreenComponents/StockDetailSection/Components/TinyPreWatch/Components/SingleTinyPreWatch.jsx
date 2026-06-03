import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { enterBufferSelectors, enterExitPlannedSelectors, fiveMinSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import MiniFiveMinChart from './MiniFiveMinChart'

function SingleTinyPreWatch({ id, index, setSelectedTickerIndex })
{

    const tickerData = useSelector(state => fiveMinSelectors.selectById(state, id))
    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })
    function provideSelector(data)
    {
        let entityToReturn = enterBufferSelectors.selectById(data.enterBufferHit, id);
        if (!entityToReturn) entityToReturn = stopLossHitSelectors.selectById(data.stopLossHit, id)
        else if (!entityToReturn) entityToReturn = enterExitPlannedSelectors.selectById(data.plannedTickers, id)
        return entityToReturn
    }

    const [flashNewPrice, setFlashNewPrice] = useState(false)
    useEffect(() =>
    {
        setFlashNewPrice(true)
        setTimeout(() => setFlashNewPrice(false), [1500])
    }, [plan?.mostRecentPrice])

    let direction = plan?.todayOpenPrice < plan?.mostRecentPrice



    return (
        <div className='singleTinyPreWatch' onClick={() => setSelectedTickerIndex(index)}>
            <div>
                <h3>{id}</h3>
                <p>{plan?.percentFromEnter.toFixed(2)}%</p>
            </div>

            <MiniFiveMinChart candleData={tickerData.candleData} openPrice={plan?.todayOpenPrice} direction={direction}
                enterPrice={plan?.plan.enterPrice} stopLossPrice={plan?.plan.stopLossPrice}
                enterBufferPrice={plan?.plan.enterBufferPrice}
            />

            <div className={`${direction ? 'positiveDay' : 'negativeDay'} tinyPriceInfo`}>
                <p className={`${flashNewPrice ? 'newIncomingPrice' : ''}`}>{plan?.mostRecentPrice.toFixed(2)}</p>
                <div className='flex'>
                    <p>{plan?.changeFromYesterdayClose.toFixed(2)}</p>
                    <p>{plan?.currentDayPercentGain.toFixed(2)}%</p>
                </div>
            </div>
        </div>
    )
}

export default SingleTinyPreWatch