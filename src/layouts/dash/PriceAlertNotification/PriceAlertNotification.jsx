import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectPriceAlertState, selectQuickAlertBelowState } from '../../../features/PriceAlerts/PriceAlertControlSlice'
import PriceAlertDropDown from './PriceAlertDropDown'
import './PriceAlertNotification.css'
import { ArrowDown, ChevronDown } from 'lucide-react'


function PriceAlertNotification()
{
    const mostRecentAlerts = useSelector(state => selectQuickAlertBelowState(state))
    const [showNotifications, setShowNotifications] = useState(false)

    return (
        <div className='flex' id='NavPriceAlert'>
            <button className='buttonIcon' onClick={() => setShowNotifications(prev => !prev)}><ChevronDown color='white' /></button>
            {mostRecentAlerts.map(t =>
                <div className='flex'>
                    <p>{t.Symbol}</p>
                    <p>Price Below: ${t.priceAlert.price} at ${t.Price}</p>
                </div>
            )}
            {showNotifications && <PriceAlertDropDown />}
        </div>
    )
}

export default PriceAlertNotification