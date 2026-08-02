import React, { useState } from 'react'
import { useManageTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'

function TradeSubmissionForm({ tickerSymbol, planId, existingTrade })
{
    const activeTradeId = existingTrade?._id
    const maxSharesForSale = existingTrade?.availableShares || undefined
    const averagePurchasePrice = existingTrade?.averagePurchasePrice || undefined

    const [recordType, setRecordType] = useState(activeTradeId ? 'sell' : 'purchase')
    const [tradeFormValues, setTradeFormValues] = useState({ positionSize: "", purchasePrice: "" })
    const [serverErrorMessage, setServerErrorMessage] = useState('')
    const [showConfirm, setShowConfirm] = useState(false)


    const hasRequiredValues = tradeFormValues.positionSize > 0 && tradeFormValues.purchasePrice > 0

    const [manageTradeRecord, isLoading] = useManageTradeRecordMutation()
    async function attemptManageTradeRecord(params)
    {
        try
        {
            if (tradeFormValues.positionSize === "" || tradeFormValues.purchasePrice === "") return setServerErrorMessage('Missing Required Values')

            const result = await manageTradeRecord({
                tickerSymbol: tickerSymbol, positionSize: tradeFormValues.positionSize, purchasePrice: tradeFormValues.purchasePrice,
                recordType, enterExitPlanId: planId, existingTradeId: activeTradeId
            })
            setServerErrorMessage('Trade Recorded')
            setTimeout(() =>
            {
                setServerErrorMessage('')
                setShowConfirm(false)
                setTradeFormValues({ positionSize: '', purchasePrice: '' })
            }, [2000])

        } catch (error)
        {
            console.log(error)
        }
    }

    function handleFormValueChange(e)
    {
        if (e.target.value === '') return setTradeFormValues(prev => { return { ...prev, [e.target.id]: '' } })
        const submissionNumber = parseFloat(e.target.value)
        if (!isNaN(submissionNumber)) setTradeFormValues(prev => { return { ...prev, [e.target.id]: submissionNumber } })
    }

    function handleSwitchingToSell()
    {
        setRecordType('sell')
        setTradeFormValues({ positionSize: '', purchasePrice: '' })
    }


    return (
        <div id='TradeSubmissionForm'>

            {recordType === 'purchase' ? <div>
                <h2>Purchase Record</h2>
                {maxSharesForSale && <p>Current Position: {maxSharesForSale} Shares</p>}
                {averagePurchasePrice && <p>Average Position Price: ${averagePurchasePrice.toFixed(2)}</p>}
            </div> :
                <div>
                    <h2>Sell Record</h2>
                    <p>Current Position: {maxSharesForSale} Shares</p>
                    {averagePurchasePrice && <p>Average Position Price: ${averagePurchasePrice.toFixed(2)}</p>}
                </div>}
            <br />
            {showConfirm ? <div>

                <div>
                    <p>Size:{tradeFormValues.positionSize}</p>
                    <p>Price: ${tradeFormValues.purchasePrice.toFixed(2)}</p>
                    <p>Transaction Total: ${(tradeFormValues.positionSize * tradeFormValues.purchasePrice).toFixed(2)}</p>
                    {serverErrorMessage}
                </div>


                <button disabled={!isLoading} onClick={() => attemptManageTradeRecord()}>Submit</button>
                <button onClick={() => setShowConfirm(false)}>Cancel</button>
            </div> :
                <div>


                    <form style={{ backgroundColor: `${recordType === 'purchase' ? 'blue' : 'green'}` }}
                        onSubmit={(e) => { e.preventDefault(); setShowConfirm(true) }}
                        onChange={(e) => { setServerErrorMessage(''); handleFormValueChange(e) }}>
                        <div>
                            <input type="number" id='purchasePrice' value={tradeFormValues.purchasePrice} step={0.01} placeholder='0' autoComplete='off' />
                            <label htmlFor="purchasePrice">Price</label>
                        </div>
                        <div>
                            <input type="number" id='positionSize' max={recordType === 'sell' ? maxSharesForSale : undefined} step={1} value={tradeFormValues.positionSize} placeholder='0' autoComplete='off' />
                            <label htmlFor="positionSize">Position Size</label>
                            {recordType === 'purchase' &&
                                <div>
                                    <button>1/8</button>
                                    <button>1/3</button>
                                    <button>1/4</button>
                                </div>
                            }
                        </div>

                        <div>


                            <p>Recorded Total: ${(tradeFormValues.positionSize * tradeFormValues.purchasePrice).toFixed(2)}</p>
                        </div>

                        <div className='flex'>
                            <button disabled={!hasRequiredValues}>Submit</button>
                            <button type='button' onClick={() => setTradeFormValues({ positionSize: "", purchasePrice: "" })}>Reset</button>
                            {recordType === 'sell' && <button type='button' disabled={!activeTradeId} onClick={() => { setTradeFormValues(prev => { return { ...prev, positionSize: maxSharesForSale } }); setRecordType('sell') }}>Close Out</button>}
                        </div>
                    </form>
                    {serverErrorMessage}

                    <div className='flex'>
                        <button style={{ backgroundColor: 'blue' }} onClick={() => { setRecordType('purchase'); setTradeFormValues({ positionSize: '', purchasePrice: '' }) }}>Purchase</button>
                        <button disabled={!activeTradeId} style={{ backgroundColor: 'green' }} onClick={() => handleSwitchingToSell()}>Sell</button>
                        <br />
                    </div>
                </div>
            }


        </div>
    )
}

export default TradeSubmissionForm