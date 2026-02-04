import React, { useEffect, useState } from 'react'
import { useGetStockKeyLevelsQuery, useUpdateStockKeyLevelsMutation } from '../../../../../../features/KeyLevels/KeyLevelSliceApi'
import { updateKeyPrice } from '../../../../../../features/Charting/chartingElements'

function SelectedKeyInputForm({ selectedStock, setShowMacroKeyLevelDisplay })
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
            const results = await updateStockKeyLevels({ chartId: selectedStock._id, updatedKeyLevels: selectedData }).unwrap()
            setShowMacroKeyLevelDisplay(false)
        } catch (error)
        {
            setErrorMessage(error.message)
            console.log(error)
        }
    }



    return (

        <form onSubmit={attemptSelectedStockKeyValueUpdate} className='LSH-SelectedStockKeyLevelInput'>
            <div id='KeyDailyFormInputs'>
                <h2>Daily Key Inputs</h2>
                <fieldset className='flex' onChange={(e) => setSelectedData(prev => ({ ...prev, [e.target.id]: parseFloat(e.target.value) }))}>
                    <div>
                        <label htmlFor="gammaFlip">Gamma Flip Line </label>
                        <input type="number" id='gammaFlip' value={selectedData?.gammaFlip} />
                    </div>
                    <div>
                        <label htmlFor="callWall">Call Wall </label>
                        <input type="number" id='callWall' value={selectedData?.callWall} />
                    </div>
                    <div>
                        <label htmlFor="putWall">Put Wall </label>
                        <input type="number" id='putWall' value={selectedData?.putWall} />
                    </div>
                </fieldset>

                <fieldset onChange={(e) => setSelectedData(prev => ({ ...prev, dailyEM: { ...prev.dailyEM, [e.target.id]: parseFloat(e.target.value) } }))}>
                    <div className='flex'>

                        <div>
                            <label htmlFor="iVolDailyEMLower">iVol Lower Daily EM </label>
                            <input type="number" id='iVolDailyEMLower' value={selectedData?.dailyEM.iVolDailyEMLower} />
                        </div>
                        <div>
                            <label htmlFor="dailyEMLower">Lower Daily EM </label>
                            <input type="number" id='dailyEMLower' value={selectedData?.dailyEM.dailyEMLower} />
                        </div>
                        <div>
                            <label htmlFor="dailyEMUpper">Upper Daily EM </label>
                            <input type="number" id='dailyEMUpper' value={selectedData?.dailyEM.dailyEMUpper} />
                        </div>
                        <div>
                            <label htmlFor="iVolDailyEMUpper">iVol Upper Daily EM </label>
                            <input type="number" id='iVolDailyEMUpper' value={selectedData?.dailyEM.iVolDailyEMUpper} />
                        </div>
                    </div>
                    <div className='flex'>
                        <div>
                            <label htmlFor="dailyClose">Daily Close </label>
                            <input type="number" id='dailyClose' value={selectedData?.dailyEM.dailyClose} />
                        </div>
                        <div>
                            <label htmlFor="sigma">Daily EM (Sigma) </label>
                            <input type="number" id='sigma' value={selectedData?.dailyEM.sigma} />
                        </div>
                        <div className='flex'>
                            <div>
                                <p>1 Sigma EM: {selectedData?.dailyEM.sigma}</p>
                                <p>Daily Upper EM: {selectedData?.dailyEM.dailyClose + selectedData?.dailyEM.sigma}</p>
                                <p>Daily Lower EM: {selectedData?.dailyEM.dailyClose - selectedData?.dailyEM.sigma}</p>
                            </div>
                            <div>
                                <p>2 Sigma EM: {2 * selectedData?.dailyEM.sigma}</p>
                                <p>Daily Upper EM: {selectedData?.dailyEM.dailyClose + (2 * selectedData?.dailyEM.sigma)}</p>
                                <p>Daily Lower EM: {selectedData?.dailyEM.dailyClose - (2 * selectedData?.dailyEM.sigma)}</p>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>

            <div id='KeyWeeklyFormInputs'>
                <h2>Weekly Key Inputs</h2>
                <fieldset className='flex' onChange={(e) => setSelectedData(prev => ({ ...prev, weeklyEM: { ...prev.weeklyEM, [e.target.id]: parseFloat(e.target.value) } }))}>
                    <div>
                        <div>
                            <label htmlFor="iVolWeeklyEMLower">Weekly EM Lower </label>
                            <input type="number" id='iVolWeeklyEMLower' value={selectedData?.weeklyEM.iVolWeeklyEMLower} />
                        </div>
                        <div>
                            <label htmlFor="iVolWeeklyEMUpper">Weekly EM Upper </label>
                            <input type="number" id='iVolWeeklyEMUpper' value={selectedData?.weeklyEM.iVolWeeklyEMUpper} />
                        </div>
                    </div>
                    <div>
                        <div>
                            <label htmlFor="weeklyClose">Weekly Close </label>
                            <input type="number" id='weeklyClose' value={selectedData?.weeklyEM.weeklyClose} />
                        </div>
                        <div>
                            <label htmlFor="sigma">Weekly EM (Sigma) </label>
                            <input type="number" id='sigma' value={selectedData?.weeklyEM.sigma} />
                        </div>
                    </div>
                    <div className='flex'>
                        <div>
                            <p>1 Sigma EM: {selectedData?.weeklyEM.sigma}</p>
                            <p>Weekly Upper EM: {selectedData?.weeklyEM.weeklyClose + selectedData?.weeklyEM.sigma}</p>
                            <p>Weekly Lower EM: {selectedData?.weeklyEM.weeklyClose - selectedData?.weeklyEM.sigma}</p>
                        </div>
                        <div>
                            <p>2 Sigma EM: {2 * selectedData?.weeklyEM.sigma}</p>
                            <p>Weekly Upper EM: {selectedData?.weeklyEM.weeklyClose + (2 * selectedData?.weeklyEM.sigma)}</p>
                            <p>Weekly Lower EM: {selectedData?.weeklyEM.weeklyClose - (2 * selectedData?.weeklyEM.sigma)}</p>
                        </div>
                    </div>
                </fieldset>
            </div>

            <div id='KeyMonthQuarterYearFormInputs'>
                <h2>Monthly/Quarterly/Yearly</h2>
                <div className='flex'>
                    <div>
                        <label htmlFor="monthUpperEM">Month's Upper EM </label>
                        <input type="number" id='monthUpperEM' value={selectedData?.monthlyEM.monthUpperEM} onChange={(e) => setSelectedData(prev => ({ ...prev, monthlyEM: { ...prev.monthlyEM, monthUpperEM: parseFloat(e.target.value) } }))} />
                    </div>
                    <div>
                        <label htmlFor="monthLowerEM">Month's Lower EM </label>
                        <input type="number" id='monthLowerEM' value={selectedData?.monthlyEM.monthLowerEM} onChange={(e) => setSelectedData(prev => ({ ...prev, monthlyEM: { ...prev.monthlyEM, monthLowerEM: parseFloat(e.target.value) } }))} />
                    </div>
                    <div>
                        <label htmlFor="quarterUpperEM">Quarter's Upper EM </label>
                        <input type="number" id='quarterUpperEM' />
                    </div>
                    <div>
                        <label htmlFor="quarterLowerEM">Quarter's Lower EM </label>
                        <input type="number" id='quarterLowerEM' />
                    </div>
                    <div>
                        <label htmlFor="yearlyUpperEM">Yearly Upper EM </label>
                        <input type="number" id='yearlyUpperEM' />
                    </div>
                    <div>
                        <label htmlFor="yearlyLowerEM">Yearly Lower EM </label>
                        <input type="number" id='yearlyLowerEM' />
                    </div>
                </div>
            </div>

            <button>Submit</button>
            <button type='button' onClick={() => setShowMacroKeyLevelDisplay(false)}>Cancel</button>
        </form>
    )
}

export default SelectedKeyInputForm