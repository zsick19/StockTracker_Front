import React, { useState } from 'react'
import { useRefreshStreamTickersMutation } from '../../../../../../../../features/auth/authApiSlice'
import { Check } from 'lucide-react'

function WelcomeGreeting()
{


    const [refreshStreamTickers] = useRefreshStreamTickersMutation()
    const [showRefreshDelivered, setShowRefreshDelivered] = useState(false)
    async function attemptStreamTickerRefresh()
    {
        try
        {
            await refreshStreamTickers().unwrap()
            setShowRefreshDelivered(true)

            setTimeout(() => { setShowRefreshDelivered(false) }, [2000])
        } catch (error)
        {
            console.log(error)
        }
    }



    return (
        <div>
            <h1>Welcome!</h1>
            <div>
                <p>Refresh Backend Stream</p>
                {showRefreshDelivered ? <p>Stream Refreshed <Check color="green" /></p> : <button onClick={() => attemptStreamTickerRefresh()}>Refresh Stream</button>}
            </div>
        </div>
    )
}

export default WelcomeGreeting