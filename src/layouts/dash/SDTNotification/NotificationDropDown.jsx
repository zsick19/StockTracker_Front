import React from 'react'
import { useDispatch } from 'react-redux'
import { clearSTDDaily } from '../../../features/STDs/StockDetailControlSlice'
import { differenceInMinutes, differenceInSeconds } from 'date-fns'
import { X } from 'lucide-react'

function NotificationDropDown({ notifications, handleMiddleViewChange, setShowListOfNotifications, prevCountRef, popUpSTDId, setPopUpSTD })
{
    const dispatch = useDispatch()

    function handleClearingBaseNotification(id, i)
    {
        dispatch(clearSTDDaily(id))
        prevCountRef.current = prevCountRef.current - 1
        if (popUpSTDId === id) setPopUpSTD(undefined)
    }


    return (
        <div className='sdtDropDown'>
            {notifications.length > 0 ?
                notifications.map((t, i) =>
                {
                    let seconds = differenceInSeconds(new Date(), new Date(t.timeStamp))

                    return (<div className={`${t.direction}STD singleSTDDropDown`}>
                        <p>{t.Symbol}</p>
                        <p>{t.Price}</p>
                        <p>{seconds > 60 ? `${differenceInMinutes(new Date(), new Date(t.timeStamp))} mins` : `${seconds} seconds`}</p>
                        <button onClick={() => { setShowListOfNotifications(false); handleMiddleViewChange(t) }}>{t.std === 'daily1Std' ? '1STD' : '2STD'}</button>
                        <button className='buttonIcon' onClick={() => handleClearingBaseNotification(t.id, i)}><X /></button>
                    </div>)
                }
                )
                : <div onClick={() => setShowListOfNotifications(false)}>
                    No notifications

                </div>}
        </div>
    )
}

export default NotificationDropDown