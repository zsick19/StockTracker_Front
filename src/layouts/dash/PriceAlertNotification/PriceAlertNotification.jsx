import React from 'react'
import { useSelector } from 'react-redux'
import { selectPriceAlertState } from '../../../features/PriceAlerts/PriceAlertControlSlice'

function PriceAlertNotification()
{
    const b = useSelector(state => selectPriceAlertState(state))
    console.log(b)

    return (
        <div>
            Price Alert--{b.priceBelowAlert.map((t) => <p>{t.Symbol} is below {t.lowestPriceAlert.price} at {t.Price}</p>)}

        </div>
    )
}

export default PriceAlertNotification