import React, { useRef, useState } from 'react'
import { useTakeInDailyZoneLevelsMutation } from '../../../../../../features/KeyLevels/KeyLevelSliceApi'
import { processZoneString } from '../../../../../../Utilities/UtilityHelperFunctions'

function ZonesInputForm({ setShowMacroKeyLevelDisplay })
{
    const [takeInDailyZoneLevels] = useTakeInDailyZoneLevelsMutation()

    const zoneRef = useRef()
    const [zoneInput, setZoneInput] = useState([])

    async function attemptZoneEntry()
    {
        let brokenUp = processZoneString(zoneRef.current.value)

        try
        {
            const results = await takeInDailyZoneLevels({ zones: brokenUp })
            setZoneInput(brokenUp)
            zoneRef.current.value = ''
        } catch (error)
        {
            console.log(error)
        }
    }


    return (
        <div>

            <div>
                ZonesInputForm
                <input type="text" ref={zoneRef} />
                <button onClick={() => attemptZoneEntry()}>Take in zones</button>
                <button onClick={() => setShowMacroKeyLevelDisplay(0)}>Clear To Graph</button>
            </div>

            <div className='flex'>
                {zoneInput.length > 0 &&
                    zoneInput.map((zone) => <div >
                        <p>{zone.ticker} Updated</p>
                    </div>)
                }
            </div>


        </div>
    )
}

export default ZonesInputForm