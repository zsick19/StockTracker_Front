import React, { useEffect, useState } from 'react'
import { useGetUsersMacroKeyLevelsQuery } from '../../../../../../features/KeyLevels/KeyLevelSliceApi'

function GeneralMacroKeyInputForm({ setShowMacroKeyLevelDisplay })
{

    const [macroInputValues, setMacroInputValues] = useState([])
    const { data, isSuccess, isError, isLoading, error } = useGetUsersMacroKeyLevelsQuery()

    useEffect(() =>
    {

        console.log(data)
        if (isSuccess) setMacroInputValues(data)
    }, [data])

    async function attemptGeneralKeyValueUpdate(e)
    {
        e.preventDefault()

    }
    return (
        <div>
            <p>Big list of generic macros and input values</p>
            <form onSubmit={attemptGeneralKeyValueUpdate}>

                {macroInputValues.map((input) =>
                {
                    return <div>{input.m}</div>
                })}
                <button>Submit</button>
                <button type='button' onClick={() => setShowMacroKeyLevelDisplay(false)}>Cancel</button>
            </form>
        </div>)
}

export default GeneralMacroKeyInputForm