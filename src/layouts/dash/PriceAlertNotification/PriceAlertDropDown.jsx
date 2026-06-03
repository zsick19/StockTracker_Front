import React from 'react'
import { useSelector } from 'react-redux'
import { selectPriceAlertState } from '../../../features/PriceAlerts/PriceAlertControlSlice'

function PriceAlertDropDown()
{

    const b = useSelector(state => selectPriceAlertState(state))
    return (
        <div id='PriceAlertDropDown'>
            {b.map(t => <div>
                <p>{t.Symbol} ${t.priceAlert.price} at ${t.Price}</p>

            </div>)}
        </div>
    )
}

export default PriceAlertDropDown