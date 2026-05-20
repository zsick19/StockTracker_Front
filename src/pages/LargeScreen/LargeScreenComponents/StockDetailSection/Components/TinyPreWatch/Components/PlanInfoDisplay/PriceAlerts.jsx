import React, { useRef, useState } from 'react'
import { useCreatePriceAlertMutation } from '../../../../../../../../features/PriceAlerts/PriceAlertApiSlice'
import { X } from 'lucide-react'

function PriceAlerts({ plan })
{
    const [priceAlertForAdd, setPriceAlertForAdd] = useState({ aboveOrBelow: true, price: "" })
    const [createPriceAlert] = useCreatePriceAlertMutation()
    const [serverResponse, setServerResponse] = useState('')

    async function attemptToAddPriceAlert()
    {
        if (!priceAlertForAdd.price) return
        try
        {
            const result = await createPriceAlert({ chartId: plan._id, ticker: plan.tickerSymbol, alert: priceAlertForAdd }).unwrap()
            setPriceAlertForAdd({ aboveOrBelow: true, price: '' })
            console.log(result)
            setServerResponse('Created')
        } catch (error)
        {
            console.log(error)
            setServerResponse(error.data.m)

        }

    }

    return (
        <div className='priceAlertPanel'>
            <div>
                {plan?.priceAlerts ?
                    plan.priceAlerts.map((t) =>
                        <div className='flex'>
                            <p>{t.priceBelow ? 'B' : 'A'}{t.price}</p>
                            <button className='buttonIcon'><X color='red' size={14} /></button>
                        </div>
                    ) :
                    <div>No alerts set for this stock</div>}
            </div>

            <div id='createPriceAlert'>
                <form onSubmit={(e) => { e.preventDefault(); attemptToAddPriceAlert(); e.target.reset() }} onChange={(e) =>
                { setServerResponse(''); setPriceAlertForAdd(prev => { return { ...prev, [e.target.name]: e.target.value } }) }}>

                    <div className='flex'>
                        <div>
                            <input className='hidden-button' type="radio" name='aboveOrBelow' id='priceBelow' value={true} defaultChecked />
                            <label className='visual-button' htmlFor="priceBelow">Below</label>
                        </div>
                        <div>
                            <input className='hidden-button' type="radio" name='aboveOrBelow' id='priceAbove' value={false} />
                            <label className='visual-button' htmlFor="priceAbove">Above</label>
                        </div>
                    </div>

                    <div>
                        <input type="double" name='price' value={priceAlertForAdd.price} placeholder='Price' />
                        <button>Submit</button>
                    </div>
                </form>
                <p>{serverResponse}</p>
            </div>
        </div>
    )
}

export default PriceAlerts