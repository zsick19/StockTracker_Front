import React, { useRef } from 'react'
import { useTakeInDailyZoneLevelsMutation } from '../../../../../../features/KeyLevels/KeyLevelSliceApi'
import { processZoneString } from '../../../../../../Utilities/UtilityHelperFunctions'

function ZonesInputForm()
{
    const [takeInDailyZoneLevels] = useTakeInDailyZoneLevelsMutation()

    const zoneRef = useRef()

    async function attemptZoneEntry()
    {
        let brokenUp = processZoneString(zoneRef.current.value)

        try
        {
            const results = await takeInDailyZoneLevels({ zones: brokenUp })
            console.log(results)
        } catch (error)
        {
            console.log(error)
        }
    }


    return (
        <div>
            ZonesInputForm
            <input type="text" ref={zoneRef} />
            <button onClick={() => attemptZoneEntry()}>Take in zones</button>

        </div>
    )
}

export default ZonesInputForm