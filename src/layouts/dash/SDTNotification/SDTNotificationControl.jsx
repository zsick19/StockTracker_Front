import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addSTDDaily, clearSTDDaily, selectStandardDeviationState, setSelectedDeviation } from '../../../features/STDs/StockDetailControlSlice'
import { Bell } from 'lucide-react'
import NotificationDropDown from './NotificationDropDown'
import './SDTNotificationControl.css'
import { setMessageNewsDetailState } from '../../../features/SelectedStocks/MessageNewsDetailControl'

function SDTNotificationControl()
{
    const dispatch = useDispatch()
    const b = useSelector(state => selectStandardDeviationState(state))
    const mostRecentNotificationId = useRef('qy5jeci2g28wQL2u1eWcLu')
    const prevCountRef = useRef(0)

    useEffect(() =>
    {
        const latestNote = b.std1Daily.at(-1)
        const notificationLength = b.std1Daily.length

        if (latestNote && latestNote.id !== mostRecentNotificationId.current)
        {
            if (b.std1Daily.length > prevCountRef.current)
            {
                setPopUpSTD(latestNote)
                const goAwayTimer = setTimeout(() => { setPopUpSTD(undefined) }, [4000])
                mostRecentNotificationId.current = latestNote?.id
                prevCountRef.current = notificationLength

                return () => clearTimeout(goAwayTimer)
            }
        }

    }, [b.std1Daily])



    const [popUpSTD, setPopUpSTD] = useState(undefined)
    const [showListOfNotifications, setShowListOfNotifications] = useState(false)

    function clearThisPopUpNotification()
    {
        dispatch(clearSTDDaily(popUpSTD.id))
        prevCountRef.current = prevCountRef.current - 1
        setPopUpSTD(undefined)
    }

    function trialForAddingNotification()
    {
        dispatch(addSTDDaily({ text: Math.random(), ticker: 'SPY' }))
    }

    function handleMiddleViewChange(notificationToGoTo)
    {
        dispatch(setMessageNewsDetailState('standardDeviation'))
        if (notificationToGoTo) dispatch(setSelectedDeviation(notificationToGoTo))
        else dispatch(setSelectedDeviation(popUpSTD))
    }


    return (
        <div id='notificationControl'>
            {popUpSTD ? <div className={`${popUpSTD.direction}STD popUpSTDNotification`}>
                <p>{popUpSTD.Symbol}</p>
                <p>Price: ${popUpSTD.Price}</p>
                <button onClick={handleMiddleViewChange}>GO</button>
                <button onClick={clearThisPopUpNotification}>Clear</button>
            </div> :
                <div className='flex'>
                    <button onClick={() => setShowListOfNotifications(prev => !prev)}><Bell /> {b.std1Daily.length}</button>
                    <button onClick={trialForAddingNotification}>Add</button>
                </div>}

            {showListOfNotifications && <NotificationDropDown notifications={b.std1Daily} popUpSTDId={popUpSTD?.id}
                handleMiddleViewChange={handleMiddleViewChange} setPopUpSTD={setPopUpSTD}
                setShowListOfNotifications={setShowListOfNotifications} prevCountRef={prevCountRef} />}

        </div>
    )
}

export default SDTNotificationControl