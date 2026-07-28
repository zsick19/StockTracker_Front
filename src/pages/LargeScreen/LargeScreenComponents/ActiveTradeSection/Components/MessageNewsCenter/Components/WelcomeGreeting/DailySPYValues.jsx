import React, { useState } from 'react'
import { useUpdateStockKeyLevelsMutation } from '../../../../../../../../features/KeyLevels/KeyLevelSliceApi';
import { ArrowLeftRight, X } from 'lucide-react';

function DailySPYValues({ showManualSpyIntake })
{
    const [spyIntakeValues, setSPYIntakeValues] = useState(undefined)
    function handleTextInput(e)
    {
        const possibleKeyToActualKey = {
            ZERODTECALL: undefined,
            ZERODTEPUT: undefined,
            ZERODTE: undefined,
            CALLWALL: undefined,
            PUTWALL: undefined,
            GAMMAFLIP: undefined
        }
        let str = e.target.value
        const regex = /([A-Za-z0-9 ]+):\s*(\d{1,4}(?:,\s*\d{1,4})*)/g;
        let match;
        let result = {}
        while ((match = regex.exec(str)) !== null)
        {
            const key = match[1].trim();
            const rawValue = match[2].trim();

            if (rawValue.includes(',')) { result[key] = rawValue.split(',').map(num => Number(num.trim()) / 10); }
            else { result[key] = Number(rawValue) / 10; }
        }
        console.log(result)
        possibleKeyToActualKey.ZERODTECALL = result['0DTE Call Wall']
        possibleKeyToActualKey.ZERODTEPUT = result['0DTE Put Wall']
        possibleKeyToActualKey.ZERODTE = result?.['Additional 0dte levels'] || result?.['Additional 0dte'] || []
        possibleKeyToActualKey.CALLWALL = result['Net Gamma Call Wall']
        possibleKeyToActualKey.PUTWALL = result['Net Gamma Put Wall']
        possibleKeyToActualKey.GAMMAFLIP = result['Gamma Flip']
        e.target.value = ''


        if (!Array.isArray(possibleKeyToActualKey.ZERODTE)) possibleKeyToActualKey.ZERODTE = [possibleKeyToActualKey.ZERODTE]

        setSPYIntakeValues(possibleKeyToActualKey)
    }

    const [updateStockKeyLevels] = useUpdateStockKeyLevelsMutation()
    async function attemptSelectedStockKeyValueUpdate()
    {
        if (!spyIntakeValues) return
        try
        {

            let selectedData = {
                callWall: spyIntakeValues.CALLWALL,
                putWall: spyIntakeValues.PUTWALL,
                oneDayToExpire: [...new Set([...spyIntakeValues.ZERODTE, spyIntakeValues.ZERODTECALL, spyIntakeValues.ZERODTEPUT])],
                gammaFlip: spyIntakeValues.GAMMAFLIP
            }
            console.log(selectedData)
            await updateStockKeyLevels({ chartId: "6952bd331482f8927092ddcc", updatedKeyLevels: selectedData }).unwrap()
        } catch (error)
        {
            setErrorMessage(error.message)
            console.log(error)
        }
    }



    function handleManualChange(e)
    {
        if (e.target.name === 'additionalZeroDTE') return
        const numberEntry = parseFloat(e.target.value)
        if (numberEntry) { setSPYIntakeValues(prev => { return { ...prev, [e.target.name]: e.target.value } }) }
        else if (numberEntry === NaN) { setSPYIntakeValues(prev => { return { ...prev, [e.target.name]: undefined } }) }

    }
    function addAdditionalZeroDTE(e)
    {
        const formData = new FormData(e.target);
        const additionalZeroDTEValue = parseFloat(formData.get('additionalZeroDTE'))
        if (additionalZeroDTEValue !== NaN)
        {
            e.target.elements.ZERODTE.value = ''
            if (spyIntakeValues?.ZERODTE) setSPYIntakeValues(prev => { return { ...prev, ZERODTE: [...prev.ZERODTE, additionalZeroDTEValue] } })
            else setSPYIntakeValues(prev => { return { ...prev, ZERODTE: [additionalZeroDTEValue] } })
        }
    }
    function clearZeroDTE(index)
    {
        let copyArrayMinusIndex = [...spyIntakeValues.ZERODTE]
        copyArrayMinusIndex.splice(index, 1)
        setSPYIntakeValues(prev => { return { ...prev, ZERODTE: copyArrayMinusIndex } })
    }

    const [showSpyValuesForSubmit, setShowSpyValuesForSubmit] = useState(false)


    return (
        <>
            {showManualSpyIntake ? <div id='ManualSPYInputContainer'>
                {showSpyValuesForSubmit ?
                    <div className='flex' style={{ fontSize: 'var(--fs-100)' }}>
                        <div>
                            <p>0 DTE CALL Wall: ${spyIntakeValues?.ZERODTECALL || 0}</p>
                            <p>0 DTE PUT Wall: ${spyIntakeValues?.ZERODTEPUT || 0}</p>
                            <p>Additional 0 DTEs: {
                                spyIntakeValues?.ZERODTE?.length > 0 ?
                                    spyIntakeValues?.ZERODTE.map((t, i) => { if (i === spyIntakeValues.ZERODTE.length - 1) return `$${t}`; else return `$${t}, ` }) : "N/A"}</p>
                        </div>
                        <div>
                            <p>Net Gamma Call Wall: ${spyIntakeValues?.CALLWALL || 0}</p>
                            <p>Net Gamma Put Wall: ${spyIntakeValues?.PUTWALL || 0}</p>
                            <p>Gamma Flip: ${spyIntakeValues?.GAMMAFLIP || 0}</p>
                        </div>
                        <div>
                            <button onClick={() => attemptSelectedStockKeyValueUpdate()}>Submit</button>
                            <button onClick={() => setShowSpyValuesForSubmit(false)}>Edit</button>
                        </div>

                    </div> :
                    <div>
                        <form id='ManualSPYInputForm' onSubmit={(e) => { e.preventDefault(); addAdditionalZeroDTE(e) }}
                            onChange={(e) => handleManualChange(e)}>
                            <div>
                                <label htmlFor="zeroDTECALL">0DTE Call Wall</label>
                                <input type="text" id='zeroDTECALL' name='ZERODTECALL' autoComplete='false' />
                            </div>
                            <div>
                                <label htmlFor="zeroDTEPUT">0DET Put Wall</label>
                                <input type="text" id='zeroDTEPUT' name='ZERODTEPUT' autoComplete='false' />
                            </div>
                            <div>
                                <label htmlFor="callWall">Gamma Call Wall</label>
                                <input type="text" id='callWall' name='CALLWALL' autoComplete='false' />
                            </div>
                            <div>
                                <label htmlFor="putWall">Gamma Put Wall</label>
                                <input type="text" id='putWall' name='PUTWALL' autoComplete='false' />
                            </div>
                            <div>
                                <label htmlFor="gammaFlip">Gamma Flip Line</label>
                                <input type="text" id='gammaFlip' name='GAMMAFLIP' autoComplete='false' />
                            </div>
                            <div>
                                <label htmlFor="ZERODTE">Additional 0DTE</label>
                                <input type="text" id='ZERODTE' name='additionalZeroDTE' autoComplete='false' />
                            </div>
                            <button type='button' onClick={() => setShowSpyValuesForSubmit(true)}>Create</button>
                            <button type='submit' style={{ display: 'none' }}>Create</button>
                        </form>
                        <div className='flex'>
                            {spyIntakeValues?.ZERODTE?.length > 0 ?
                                <div className='flex'>
                                    {spyIntakeValues.ZERODTE.map((t, i) => <p>{t} <button onClick={() => clearZeroDTE(i)}><X /></button></p>)}
                                    <button onClick={() => setSPYIntakeValues(prev => { return { ...prev, ZERODTE: [] } })}>clear All</button>
                                </div>
                                : ""
                            }
                        </div>
                    </div>
                }
            </div> :
                <div id='AutoSPYInputContainer'>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="text" id="spyInput" onChange={handleTextInput} placeholder='Paste Here' />
                        <label htmlFor="spyInput" style={{ cursor: 'pointer', textAlign: 'center', color: '#888' }}>
                            SPY Daily Values
                        </label>
                    </div >

                    <div>
                        <p>0 DTE CALL Wall: ${spyIntakeValues?.ZERODTECALL || 0}</p>
                        <p>0 DTE PUT Wall: ${spyIntakeValues?.ZERODTEPUT || 0}</p>
                        <p>Additional 0 DTEs: {spyIntakeValues?.ZERODTE?.length > 0 ? spyIntakeValues?.ZERODTE.map((t, i) => { if (i === spyIntakeValues.ZERODTE.length - 1) return `$${t}`; else return `$${t}, ` }) : "N/A"}</p>
                        <br />
                        <p>Net Gamma Call Wall: ${spyIntakeValues?.CALLWALL || 0}</p>
                        <p>Net Gamma Put Wall: ${spyIntakeValues?.PUTWALL || 0}</p>
                        <p>Gamma Flip: ${spyIntakeValues?.GAMMAFLIP || 0}</p>
                    </div>
                    <div>
                        <button onClick={() => attemptSelectedStockKeyValueUpdate()}>Submit</button>
                        <button onClick={() => setSPYIntakeValues(undefined)}>Reset</button>
                    </div>

                </div>
            }
        </>
    )
}

export default DailySPYValues