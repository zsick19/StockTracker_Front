import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { enterBufferSelectors, enterExitPlannedSelectors, fiveMinSelectors, highImportanceSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import MiniFiveMinChart from './MiniFiveMinChart'

function SingleTinyPreWatch({ id, watchList, index, setSelectedTickerIndex })
{
    const tickerData = useSelector(state => fiveMinSelectors.selectById(state, id))
    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })
    function provideSelector(data)
    {
        let entityToReturn
        switch (watchList)
        {
            case 'enterBufferHit': entityToReturn = enterBufferSelectors.selectById(data.enterBufferHit, id); break
            case 'stopLossHit': entityToReturn = stopLossHitSelectors.selectById(data.stopLossHit, id); break
        }
        if (!entityToReturn) entityToReturn = stopLossHitSelectors.selectById(data.stopLossHit, id)
        if (!entityToReturn) entityToReturn = highImportanceSelectors.selectById(data.highImportance, id)
        if (!entityToReturn) entityToReturn = enterExitPlannedSelectors.selectById(data.plannedTickers, id)
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

            <MiniFiveMinChart candleData={tickerData.candleData} openPrice={plan?.todayOpenPrice} direction={direction} enterPrice={plan?.plan.enterPrice} stopLossPrice={plan?.plan.stopLossPrice} />

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