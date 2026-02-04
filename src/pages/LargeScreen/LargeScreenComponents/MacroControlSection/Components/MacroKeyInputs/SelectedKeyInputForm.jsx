import React, { useEffect, useState } from 'react'
import { useGetStockKeyLevelsQuery, useUpdateStockKeyLevelsMutation } from '../../../../../../features/KeyLevels/KeyLevelSliceApi'
import { updateKeyPrice } from '../../../../../../features/Charting/chartingElements'

function SelectedKeyInputForm({ selectedStock, setShowMacroKeyLevelDisplay })
{

    console.log(selectedStock)

    const [selectedData, setSelectedData] = useState({
        gammaFlip: undefined, callWall: undefined, putWall: undefined,
        iVolEMDailyLower: undefined, iVolEMDailyUpper: undefined,
        iVolEMWeeklyLower: undefined, iVolEMWeeklyUpper: undefined,
        dailyClose: undefined, dailySigma: undefined,
        weeklyClose: undefined, weeklySigma: undefined
    })
    const [errorMessage, setErrorMessage] = useState()

    const [updateStockKeyLevels] = useUpdateStockKeyLevelsMutation()
    const { data, isSuccess, isLoading, isError, error } = useGetStockKeyLevelsQuery({ chartId: selectedStock._id })
    useEffect(() => { if (isSuccess) { setSelectedData(prev => ({ ...prev, ...data })) } }, [data])
        
    console.log(selectedData)

    async function attemptSelectedStockKeyValueUpdate(e)
    {
        e.preventDefault()
        try
        {
            const results = await updateStockKeyLevels({ chartId: selectedStock._id, updatedKeyLevels: selectedData }).unwrap()
            console.log(results)
        } catch (error)
        {
            setErrorMessage(error.message)
            console.log(error)
        }
    }

    function handleKeyValueInputChange(e)
    {
        setSelectedData(prev => ({ ...prev, [e.target.id]: parseFloat(e.target.value) }))
    }

    return (

        <form onSubmit={attemptSelectedStockKeyValueUpdate} className='LSH-SelectedStockKeyLevelInput' onChange={handleKeyValueInputChange}>
            <div>
                <h2>Daily Key Inputs</h2>
                <div className='flex'>
                    <div>
                        <label htmlFor="gammaFlip">Gamma Flip Line </label>
                        <input type="number" id='gammaFlip' value={selectedData.gammaFlip} />
                    </div>
                    <div>
                        <label htmlFor="callWall">Call Wall </label>
                        <input type="number" id='callWall' value={selectedData.callWall} />
                    </div>
                    <div>
                        <label htmlFor="putWall">Put Wall </label>
                        <input type="number" id='putWall' value={selectedData.putWall} />
                    </div>
                </div>

                <div className='flex'>
                    <div>
                        <label htmlFor="iVolDailyLower">iVol Daily EM </label>
                        <input type="number" id='iVolDailyLower' />
                    </div>
                    <div>
                        <label htmlFor="dailyLowerEM">Lower Daily EM </label>
                        <input type="number" id='dailyLowerEM' />
                    </div>
                    <div>
                        <label htmlFor="dailyUpperEM">Upper Daily EM </label>
                        <input type="number" id='dailyUpperEM' />
                    </div>
                    <div>
                        <label htmlFor="iVolDailyUpper">iVol Upper Daily EM </label>
                        <input type="number" id='iVolDailyUpper' />
                    </div>
                </div>

                <div className='flex'>
                    <div>
                        <label htmlFor="dailyClose">Daily Close </label>
                        <input type="number" id='dailyClose' value={selectedData.dailyClose} />
                    </div>
                    <div>
                        <label htmlFor="dailySigma">Daily EM (Sigma) </label>
                        <input type="number" id='dailySigma' value={selectedData.dailySigma} />
                    </div>
                    <div className='flex'>
                        <div>
                            <p>1 Sigma EM: {selectedData.dailySigma}</p>
                            <p>Daily Upper EM: {selectedData.dailyClose + selectedData.dailySigma}</p>
                            <p>Daily Lower EM: {selectedData.dailyClose - selectedData.dailySigma}</p>
                        </div>

                        <div>
                            <p>2 Sigma EM: {2 * selectedData.dailySigma}</p>
                            <p>Daily Upper EM: {selectedData.dailyClose + (2 * selectedData.dailySigma)}</p>
                            <p>Daily Lower EM: {selectedData.dailyClose - (2 * selectedData.dailySigma)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <br />
            <div>
                <h2>Weekly Key Inputs</h2>
                <div className='flex'>
                    <div>
                        <div>
                            <label htmlFor="iVolEMWeeklyLower">Weekly EM Lower </label>
                            <input type="number" id='iVolEMWeeklyLower' value={selectedData.weeklyIVolEMLower} />
                        </div>
                        <div>
                            <label htmlFor="iVolEMWeeklyUpper">Weekly EM Upper </label>
                            <input type="number" id='iVolEMWeeklyUpper' value={selectedData.weeklyIVolEMUpper} />
                        </div>
                    </div>
                    <div>
                        <div>
                            <label htmlFor="weeklyClose">Weekly Close </label>
                            <input type="number" id='weeklyClose' value={selectedData.weeklyClose} />
                        </div>
                        <div>
                            <label htmlFor="weeklySigma">Weekly EM (Sigma) </label>
                            <input type="number" id='weeklySigma' value={selectedData.weeklySigma} />
                        </div>
                    </div>
                    <div className='flex'>
                        <div>
                            <p>1 Sigma EM: {selectedData.weeklySigma}</p>
                            <p>Weekly Upper EM: {selectedData.weeklyClose + selectedData.weeklySigma}</p>
                            <p>Weekly Lower EM: {selectedData.weeklyClose - selectedData.weeklySigma}</p>
                        </div>
                        <div>
                            <p>2 Sigma EM: {2 * selectedData.weeklySigma}</p>
                            <p>Weekly Upper EM: {selectedData.weeklyClose + (2 * selectedData.weeklySigma)}</p>
                            <p>Weekly Lower EM: {selectedData.weeklyClose - (2 * selectedData.weeklySigma)}</p>
                        </div>
                    </div>

                </div>
            </div>
            <br />
            {/* monthly/quarterly/yearly inputs */}
            <div>
                <h2>Monthly/Quarterly/Yearly</h2>
                <div className='flex'>
                    <div>
                        <label htmlFor="monthUpperEM">Month's Upper EM </label>
                        <input type="number" id='monthUpperEM' />
                    </div>
                    <div>
                        <label htmlFor="monthLowerEM">Month's Lower EM </label>
                        <input type="number" id='monthLowerEM' />
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
            <br />

            <button>Submit</button>
            <button type='button' onClick={() => setShowMacroKeyLevelDisplay(false)}>Cancel</button>
        </form>
    )
}

export default SelectedKeyInputForm