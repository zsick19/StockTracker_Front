import React, { useRef, useState } from 'react'
import { useCreatePriceAlertMutation, useRemovePriceAlertMutation } from '../../../../../../../../features/PriceAlerts/PriceAlertApiSlice'
import { ArrowDownFromLine, ArrowUpFromLine, X } from 'lucide-react'

function PriceAlerts({ plan })
{
    const [priceAlertForAdd, setPriceAlertForAdd] = useState({ aboveOrBelow: true, price: "" })
    const [serverResponse, setServerResponse] = useState('')

    const [createPriceAlert] = useCreatePriceAlertMutation()
    async function attemptToAddPriceAlert()
    {
        if (!priceAlertForAdd.price) return
        try
        {
            const result = await createPriceAlert({ chartId: plan._id, ticker: plan.tickerSymbol, alert: priceAlertForAdd }).unwrap()
            setPriceAlertForAdd({ aboveOrBelow: true, price: '' })
            setServerResponse('Created')
        } catch (error)
        {
            console.log(error)
            setServerResponse(error.data.m)
        }
    }

    const [removePriceAlert] = useRemovePriceAlertMutation()
    async function attemptToRemovePriceAlert(alertToRemove)
    {
        try
        {
            console.log(alertToRemove._id)
            const result = await removePriceAlert({ ticker: alertToRemove.ticker, chartId: plan._id, alertId: alertToRemove._id }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }

    return (
        <div className='priceAlertPanel'>
            <div>
                {(plan?.priceAlerts?.length > 0) ?
                    plan.priceAlerts.map((t) =>
                        <div className='flex'>
                            <p>{t.priceBelow ? <ArrowDownFromLine  /> : <ArrowUpFromLine />}{t.price}</p>
                            <button className='buttonIcon' onClick={() => attemptToRemovePriceAlert(t)}><X color='red' size={14} /></button>
                        </div>
                    ) :
                    <div>No alerts set for this stock</div>}
            </div>

            <div id='createPriceAlert'>
                <form className='flex' onSubmit={(e) => { e.preventDefault(); attemptToAddPriceAlert(); e.target.reset() }} onChange={(e) =>
                { setServerResponse(''); setPriceAlertForAdd(prev => { return { ...prev, [e.target.name]: e.target.value } }) }}>

                    <div>
                        <div className='flex'>
                            <input type="double" name='price' value={priceAlertForAdd.price} placeholder='Price' autoComplete='false' />
                            <button>Submit</button>
                        </div>
                        {serverResponse ? <p>{serverResponse}</p> : <p>Create Alert</p>}
                    </div>

                    <div >
                        <input className='hidden-button' type="radio" name='aboveOrBelow' id='priceBelow' value={true} defaultChecked />
                        <label className='visual-button' htmlFor="priceBelow" title='Below Price'><ArrowDownFromLine size={12} /></label>

                        <input className='hidden-button' type="radio" name='aboveOrBelow' id='priceAbove' value={false} />
                        <label className='visual-button' htmlFor="priceAbove" title='Above Price'><ArrowUpFromLine size={12} /></label>
                    </div>


                </form>
            </div>
        </div>
    )
}

export default PriceAlerts