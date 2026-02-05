import React, { useEffect, useState } from 'react'
import { useGetStockKeyLevelsQuery, useUpdateStockKeyLevelsMutation } from '../../../../../../features/KeyLevels/KeyLevelSliceApi'
import { updateKeyPrice } from '../../../../../../features/Charting/chartingElements'
import MonthlyInputForm from './Components/MonthlyInputForm'
import WeeklyInputForm from './Components/WeeklyInputForm'
import DailyInputForm from './Components/DailyInputForm'

function SelectedKeyInputForm({ selectedStock, setShowMacroKeyLevelDisplay, showDailyWeeklyMonthly })
{
    const [selectedData, setSelectedData] = useState()
    const [errorMessage, setErrorMessage] = useState()

    const [updateStockKeyLevels] = useUpdateStockKeyLevelsMutation()
    const { data, isSuccess, isLoading, isError, error } = useGetStockKeyLevelsQuery({ chartId: selectedStock._id })


    useEffect(() => { if (isSuccess) { setSelectedData(data) } }, [data])

    async function attemptSelectedStockKeyValueUpdate(e)
    {
        e.preventDefault()
        try
        {
            await updateStockKeyLevels({ chartId: selectedStock._id, updatedKeyLevels: selectedData }).unwrap()
            setShowMacroKeyLevelDisplay(false)
        } catch (error)
        {
            setErrorMessage(error.message)
            console.log(error)
        }
    }



    return (

        <form onSubmit={attemptSelectedStockKeyValueUpdate} className='LSH-SelectedStockKeyLevelInput'>
            {showDailyWeeklyMonthly === 0 ?
                <DailyInputForm selectedData={selectedData} setSelectedData={setSelectedData} /> :
                showDailyWeeklyMonthly === 1 ?
                    <WeeklyInputForm setSelectedData={setSelectedData} selectedData={selectedData} /> :
                    <MonthlyInputForm selectedData={selectedData} setSelectedData={setSelectedData} />}
            <button>Submit</button>
            <button type='button' onClick={() => setShowMacroKeyLevelDisplay(false)}>Cancel</button>
        </form>
    )
}

export default SelectedKeyInputForm