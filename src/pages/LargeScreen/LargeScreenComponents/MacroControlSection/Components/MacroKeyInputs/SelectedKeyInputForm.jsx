import React, { useEffect, useState } from 'react'
import { useGetStockKeyLevelsQuery, useUpdateStockKeyLevelsMutation } from '../../../../../../features/KeyLevels/KeyLevelSliceApi'
import { updateKeyPrice } from '../../../../../../features/Charting/chartingElements'

function SelectedKeyInputForm({ selectedStock, setShowMacroKeyLevelDisplay })
{
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

    useEffect(() =>
    {
        if (isSuccess) { setSelectedData(prev => ({ ...prev, ...data })) }
    }, [data])

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
        <div>
            <p>Macro Input for {selectedStock.ticker}</p>
            <form onSubmit={attemptSelectedStockKeyValueUpdate} className='LSH-SelectedStockKeyLevelInput' onChange={handleKeyValueInputChange}>


                <div>
                    <p>Daily Key Inputs</p>
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
                    <br />

                    <div className='flex'>
                        <div>
                            <div>
                                <label htmlFor="dailyClose">Daily Close </label>
                                <input type="number" id='dailyClose' value={selectedData.dailyClose} />
                            </div>
                            <div>
                                <label htmlFor="dailySigma">Daily EM (Sigma) </label>
                                <input type="number" id='dailySigma' value={selectedData.dailySigma} />
                            </div>
                        </div>

                        {(selectedData.dailyClose && selectedData.dailySigma) &&
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
                                <br />
                                <div>
                                    <div>
                                        <label htmlFor="iVolEMDailyUpper">iVol Daily EM Upper </label>
                                        <input type="number" id='iVolEMDailyUpper' value={selectedData.iVolEMUpper} />
                                    </div>
                                    <div>
                                        <label htmlFor="iVolEMDailyLower">iVol Daily EM Lower </label>
                                        <input type="number" id='iVolEMDailyLower' value={selectedData.iVolEMLower} />
                                    </div>
                                </div>
                            </div>}
                    </div>
                </div>

                <br />
                <br />
                <div>
                    <p>Weekly Key Inputs</p>
                    <br />
                    <div className='flex'>
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
                        {(selectedData.weeklyClose && selectedData.weeklySigma) &&
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
                                <br />
                                <div>
                                    <div>
                                        <label htmlFor="iVolEMWeeklyUpper">iVol Weekly EM Upper </label>
                                        <input type="number" id='iVolEMWeeklyUpper' value={selectedData.weeklyIVolEMUpper} />
                                    </div>
                                    <div>
                                        <label htmlFor="iVolEMWeeklyLower">iVol Weekly EM Lower </label>
                                        <input type="number" id='iVolEMWeeklyLower' value={selectedData.weeklyIVolEMLower} />
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <button>Submit</button>
                <button type='button' onClick={() => setShowMacroKeyLevelDisplay(false)}>Cancel</button>
            </form>
        </div>
    )
}

export default SelectedKeyInputForm