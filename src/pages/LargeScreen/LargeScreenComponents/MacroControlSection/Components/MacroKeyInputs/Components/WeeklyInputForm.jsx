import React, { useRef } from 'react'

function WeeklyInputForm({ selectedData, setSelectedData })
{
    const startDateInput = useRef()
    const upperInput = useRef()
    const lowerInput = useRef()



    return (
        <div id='KeyWeeklyFormInputs'>
            <h2>Weekly Key Inputs</h2>
            <fieldset className='flex' onChange={(e) => setSelectedData(prev => ({ ...prev, weeklyEM: { ...prev.weeklyEM, [e.target.id]: parseFloat(e.target.value) } }))}>
                <div>
                    <div>
                        <label htmlFor="iVolWeeklyEMLower">Weekly EM Lower </label>
                        <input type="number" id='iVolWeeklyEMLower' value={selectedData?.weeklyEM?.iVolWeeklyEMLower} />
                    </div>
                    <div>
                        <label htmlFor="iVolWeeklyEMUpper">Weekly EM Upper </label>
                        <input type="number" id='iVolWeeklyEMUpper' value={selectedData?.weeklyEM?.iVolWeeklyEMUpper} />
                    </div>
                </div>
                <div>
                    <div>
                        <label htmlFor="weeklyClose">Weekly Close </label>
                        <input type="number" id='weeklyClose' value={selectedData?.weeklyEM?.weeklyClose} />
                    </div>
                    <div>
                        <label htmlFor="sigma">Weekly EM (Sigma) </label>
                        <input type="number" id='sigma' value={selectedData?.weeklyEM?.sigma} />
                    </div>
                </div>
                <div className='flex'>
                    <div>
                        <p>1 Sigma EM: {selectedData?.weeklyEM?.sigma}</p>
                        <p>Weekly Upper EM: {selectedData?.weeklyEM?.weeklyClose + selectedData?.weeklyEM?.sigma}</p>
                        <p>Weekly Lower EM: {selectedData?.weeklyEM?.weeklyClose - selectedData?.weeklyEM?.sigma}</p>
                    </div>
                    <div>
                        <p>2 Sigma EM: {2 * selectedData?.weeklyEM?.sigma}</p>
                        <p>Weekly Upper EM: {selectedData?.weeklyEM?.weeklyClose + (2 * selectedData?.weeklyEM?.sigma)}</p>
                        <p>Weekly Lower EM: {selectedData?.weeklyEM?.weeklyClose - (2 * selectedData?.weeklyEM?.sigma)}</p>
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <div>
                    {selectedData?.weeklyEM.previousWeeklyEM.map((week) => <div className='flex'>
                        <p>Upper: {week.upper}</p>
                        <p>Lower: {week.lower}</p>
                        <p>{week.startDate.slice(0, 10)}</p>
                    </div>
                    )}
                </div>

                <label htmlFor="startOfWeek">Upper</label>
                <input type="date" name="" id="startOfWeek" ref={startDateInput} />

                <label htmlFor="upper">Upper</label>
                <input type="double" id='upper' ref={upperInput} />

                <label htmlFor="lower">Lower</label>
                <input type="double" id='lower' ref={lowerInput} />

                <button type='button' onClick={() => setSelectedData(prev => ({
                    ...prev, weeklyEM: {
                        ...prev.weeklyEM, previousWeeklyEM: [...prev.weeklyEM.previousWeeklyEM,
                        {
                            startDate: startDateInput.current.value,
                            upper: parseFloat(upperInput.current.value),
                            lower: parseFloat(lowerInput.current.value)
                        }]
                    }
                }))}>Add To Previous Week</button>
            </fieldset>
        </div>
    )
}

export default WeeklyInputForm