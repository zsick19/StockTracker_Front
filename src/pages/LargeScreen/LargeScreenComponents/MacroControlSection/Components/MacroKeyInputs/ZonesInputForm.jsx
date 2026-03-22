import React, { useRef, useState } from 'react'
import { useTakeInDailyExpectedMovesMutation, useTakeInDailyZoneLevelsMutation, useTakeInMonthlyExpectedMovesMutation, useTakeInQuarterlyExpectedMovesMutation, useTakeInWeeklyExpectedMovesMutation } from '../../../../../../features/KeyLevels/KeyLevelSliceApi'
import { processStandardDailyExpectedMoves, processZoneString } from '../../../../../../Utilities/UtilityHelperFunctions'

function ZonesInputForm({ setShowMacroKeyLevelDisplay })
{
    const [takeInDailyZoneLevels] = useTakeInDailyZoneLevelsMutation()
    const [takeInDailyExpectedMoves] = useTakeInDailyExpectedMovesMutation()
    const [takeInWeeklyExpectedMoves] = useTakeInWeeklyExpectedMovesMutation()
    const [takeInQuarterlyExpectedMoves] = useTakeInQuarterlyExpectedMovesMutation()
    const [takeInMonthlyExpectedMoves] = useTakeInMonthlyExpectedMovesMutation()

    const zoneRef = useRef()
    const [zoneInput, setZoneInput] = useState(undefined)

    async function attemptZoneEntry()
    {
        let brokenUp = processZoneString(zoneRef.current.value)

        try
        {
            const results = await takeInDailyZoneLevels({ zones: brokenUp })
            setZoneInput('Zone Data Inputted')
            zoneRef.current.value = ''
        } catch (error)
        {
            console.log(error)
        }
    }

    const dailyMovesRef = useRef()
    async function attemptDailyExpectedMoves()
    {
        let moveBrokenUp = processStandardDailyExpectedMoves(dailyMovesRef.current.value)
        try
        {
            const results = await takeInDailyExpectedMoves({ expectedMoves: moveBrokenUp })

            setZoneInput('Daily Expected Moves Inputted')
            dailyMovesRef.current.value = ''
        } catch (error)
        {
            console.log(error)
        }

    }

    const weeklyMovesRef = useRef()
    async function attemptWeeklyExpectedMoves()
    {
        let brokenUpText = processStandardDailyExpectedMoves(weeklyMovesRef.current.value)
        try
        {
            const results = await takeInWeeklyExpectedMoves({ expectedMoves: brokenUpText })
            setZoneInput('Weekly Expected Moves Inputted')
            weeklyMovesRef.current.value = ''
        } catch (error)
        {
            console.log(error)
        }
    }
    const monthlyMovesRef = useRef()
    async function attemptMonthlyExpectedMoves()
    {
        let brokenUpText = processStandardDailyExpectedMoves(monthlyMovesRef.current.value)
        try
        {
            const results = await takeInMonthlyExpectedMoves({ expectedMoves: brokenUpText })
            setZoneInput('Monthly Expected Moves Inputted')
            monthlyMovesRef.current.value = ''
        } catch (error)
        {
            console.log(error)
        }
    }

    const quarterlyMovesRef = useRef()
    async function attemptQuarterlyExpectedMoves()
    {
        let brokenUpText = processStandardDailyExpectedMoves(quarterlyMovesRef.current.value)
        try
        {
            const results = await takeInQuarterlyExpectedMoves({ expectedMoves: brokenUpText })
            setZoneInput('Quarterly Expected Moves Inputted')

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

            {zoneInput ? <p>{zoneInput}</p> : ""}

            <div>
                <p>Daily Expected Macro Moves</p>
                <textarea ref={dailyMovesRef} />
                <button onClick={() => attemptDailyExpectedMoves()}>Take In Daily Expected Moves</button>
            </div>


            <div>
                <p>Weekly Expected Macro Moves</p>
                <textarea ref={weeklyMovesRef} />
                <button onClick={() => attemptWeeklyExpectedMoves()}>Take In Weekly Expected Moves</button>
            </div>
            <div>
                <p>Monthly Expected Macro Moves</p>
                <textarea ref={monthlyMovesRef} />
                <button onClick={() => attemptMonthlyExpectedMoves()}>Take In Monthly Expected Moves</button>
            </div>
            <div>
                <p>Quarterly Expected Macro Moves</p>
                <textarea ref={quarterlyMovesRef} />
                <button onClick={() => attemptQuarterlyExpectedMoves()}>Take In Quarterly Expected Moves</button>
            </div>

        </div>
    )
}

export default ZonesInputForm