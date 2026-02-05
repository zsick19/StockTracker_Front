import React, { useRef } from 'react'

function DailyInputForm({ selectedData, setSelectedData })
{

    const addThisToOneDayToExpire = useRef()
    return (
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
            </fieldset>
            <fieldset onChange={(e) => setSelectedData(prev => ({ ...prev, standardDeviation: { ...prev.standardDeviation, [e.target.id]: parseFloat(e.target.value) } }))}>
                <div className='flex'>
                    <div>
                        <label htmlFor="close">Daily Close </label>
                        <input type="number" id='close' value={selectedData?.standardDeviation?.close} />
                    </div>
                    <div>
                        <label htmlFor="sigma">Daily EM (Sigma) </label>
                        <input type="number" id='sigma' value={selectedData?.standardDeviation?.sigma} />
                    </div>
                    <div className='flex'>
                        <div>
                            <p>1 Sigma: +/- ${selectedData?.standardDeviation?.sigma}</p>
                            <p>1 Sigma Upper: ${(selectedData?.standardDeviation?.close + selectedData?.standardDeviation?.sigma).toFixed(2)}</p>
                            <p>1 Sigma Lower: ${(selectedData?.standardDeviation?.close - selectedData?.standardDeviation?.sigma).toFixed(2)}</p>
                        </div>
                        <div>
                            <p>2 Sigma: +/- ${2 * selectedData?.standardDeviation?.sigma}</p>
                            <p>2 Sigma Upper: ${(selectedData?.standardDeviation?.close + (2 * selectedData?.standardDeviation?.sigma)).toFixed(2)}</p>
                            <p>2 Sigma Lower: ${(selectedData?.standardDeviation?.close - (2 * selectedData?.standardDeviation?.sigma)).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </fieldset>
            <fieldset>

                <div className='flex'>
                    {selectedData?.oneDayToExpire.map((dte) => <p>{dte}</p>)}
                </div>

                <input type="number" ref={addThisToOneDayToExpire} />
                <button type='button' onClick={() => setSelectedData(prev => ({ ...prev, oneDayToExpire: [...prev.oneDayToExpire, parseFloat(addThisToOneDayToExpire.current.value)] }))}>Add</button>
                <button type='button' onClick={() => setSelectedData(prev => ({ ...prev, oneDayToExpire: [] }))}>Clear DTE</button>
            </fieldset>
        </div>
    )
}

export default DailyInputForm