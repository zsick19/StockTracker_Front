import React, { useEffect, useState } from 'react'
import { useGetUsersMacroKeyLevelsQuery } from '../../../../../../features/KeyLevels/KeyLevelSliceApi'

function GeneralMacroKeyInputForm({ setShowMacroKeyLevelDisplay })
{
    const [macroKeyLevelsForEdit, setMacroKeyLevelsForEdit] = useState([])
    const { data, isSuccess, isError, isLoading, error } = useGetUsersMacroKeyLevelsQuery()
    useEffect(() => { if (isSuccess) setMacroKeyLevelsForEdit(data) }, [data])

        async function attemptGeneralKeyValueUpdate(e)
    {
        e.preventDefault()
        console.log(macroInputValues)

    }

    function handleInputChange(index, field, subField, value)
    {
        const newData = [...macroKeyLevelsForEdit]
        if (field === 'dailyEM') newData[index] = { ...newData[index], dailyEM: { ...newData[index].dailyEM, [subField]: value } }
        if (field === 'weeklyEM') newData[index] = { ...newData[index], weeklyEM: { ...newData[index].weeklyEM, [subField]: value } }

        setMacroKeyLevelsForEdit(newData)
    }


    return (
        <div>
            <p>Big list of generic macros and input values</p>
            <form onSubmit={attemptGeneralKeyValueUpdate}>

                <table>
                    <thead>
                        <tr>
                            <th>Ticker</th>
                            <th>Daily Close</th>
                            <th>Daily Sigma</th>
                        </tr>
                    </thead>
                    <tbody>
                        {macroKeyLevelsForEdit.map((input, i) =>
                        {
                            return <tr key={input._id}>
                                <td>{input.ticker}</td>
                                <td><input type="number" value={input.dailyEM.dailyClose} onChange={(e) => handleInputChange(i, 'daily', 'dailyClose', e.target.value)} /></td>
                                <td><input type="number" value={input.dailyEM.sigma} onChange={(e) => handleInputChange(i, 'daily', 'sigma', e.target.value)} /></td>
                            </tr>
                        })}

                    </tbody>
                </table>
                <button>Submit</button>
                <button type='button' onClick={() => setShowMacroKeyLevelDisplay(false)}>Cancel</button>
            </form>
        </div>)
}

export default GeneralMacroKeyInputForm