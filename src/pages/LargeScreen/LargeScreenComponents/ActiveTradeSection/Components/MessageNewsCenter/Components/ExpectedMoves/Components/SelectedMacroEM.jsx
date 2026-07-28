import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useGetStockKeyLevelsQuery, useTakeInDailyExpectedMovesForAlertsMutation, useUpdateStockKeyLevelsMutation } from '../../../../../../../../../features/KeyLevels/KeyLevelSliceApi'
import { X } from 'lucide-react'
import { selectSPYIdFromUser } from '../../../../../../../../../features/Initializations/InitializationSliceApi'
import { useSelector } from 'react-redux'
import { processStandardDailyForAlerts } from '../../../../../../../../../Utilities/UtilityHelperFunctions'

function SPYSelectedMacroEM()
{

    const memoizedSelectedSPYId = useMemo(() => selectSPYIdFromUser(), [])
    const usersSPYId = useSelector(memoizedSelectedSPYId)

    const [updateStockKeyLevels] = useUpdateStockKeyLevelsMutation()
    const { data, isSuccess, isLoading, isError, error } = useGetStockKeyLevelsQuery({ chartId: usersSPYId })
    const [takeInDailyExpectedMovesForAlerts] = useTakeInDailyExpectedMovesForAlertsMutation()

    const [selectedData, setSelectedData] = useState()
    const [previousWeeklyEM, setPreviousWeeklyEM] = useState([])
    const [previousMonthlyEM, setPreviousMonthlyEM] = useState([])
    const [dte, setDte] = useState([])

    const [weekMonthQuarter, setWeekMonthQuarter] = useState(0)

    useEffect(() =>
    {
        if (isSuccess)
        {
            setSelectedData(data)
            setDte(data.oneDayToExpire)
            setPreviousWeeklyEM([...data.weeklyEM.previousWeeklyEM].reverse())
            setPreviousMonthlyEM([...data.monthlyEM.previousMonthlyEM].reverse())
        }
    }, [data])



    const dteInput = useRef()
    function addDTEValues(e)
    {
        let dteValue = parseFloat(e.target.dteInput.value)
        if (dteValue) setDte(prev => [...prev, dteValue])
        e.target.dteInput.value = ''
    }
    function clearSingleDTEValue(i)
    {
        setDte(prev => prev.toSpliced(i, 1))
    }



    function addWeeklyEMValues(e)
    {
        let weeklyClose = parseFloat(e.target.weeklyClose.value)
        let weeklySigma = parseFloat(e.target.weeklySigma.value)
        let chosenDate = new Date(e.target.weeklyDate.value).toISOString()

        if (!weeklyClose || !weeklySigma || e.target.weeklyDate.value === '') return

        let previousUpdate = {
            upper: (weeklyClose + weeklySigma).toFixed(2),
            lower: (weeklyClose - weeklySigma).toFixed(2),
            startDate: chosenDate
        }

        let updatedWeeklyEM = {
            iVolWeeklyEMUpper: weeklyClose + weeklySigma,
            iVolWeeklyEMLower: weeklyClose - weeklySigma,
            weeklyClose,
            sigma: weeklySigma,
            lastUpdated: new Date(),
            previousWeeklyEM: [...selectedData.weeklyEM.previousWeeklyEM, previousUpdate]
        }

        setSelectedData(prev => { return { ...prev, weeklyEM: updatedWeeklyEM } })

        setPreviousWeeklyEM(prev => [previousUpdate, ...prev])
    }
    function clearSinglePreviousWeeklyEM(i)
    {
        let copy = previousWeeklyEM.toSpliced(i, 1)
        setPreviousWeeklyEM(copy)
        setSelectedData(prev =>
        {
            return {
                ...prev, weeklyEM: {
                    ...prev.weeklyEM,
                    previousWeeklyEM: copy
                }
            }
        })
    }

    async function addMonthlyEMValues(e)
    {
        let monthlyClose = parseFloat(e.target.monthlyClose.value)
        let monthlySigma = parseFloat(e.target.monthlySigma.value)
        let chosenDate = new Date(e.target.monthlyDate.value).toISOString()

        if (!monthlyClose || !monthlySigma || e.target.weeklyDate.value === '') return

        let previousUpdate = {
            upper: (monthlyClose + monthlySigma).toFixed(2),
            lower: (monthlyClose - monthlySigma).toFixed(2),
            startDate: chosenDate
        }

        let updateMonthlyEM = {

        }

    }

    async function attemptSelectedStockKeyValueUpdate()
    {
        try
        {
            await updateStockKeyLevels({ chartId: usersSPYId, updatedKeyLevels: selectedData }).unwrap()

        } catch (error)
        {
            setErrorMessage(error.message)
            console.log(error)
        }
    }


    const dailyEMAlertIntake = useRef()

    async function attemptProcessingOfDailyAlerts()
    {
        let tickerEMIntake = dailyEMAlertIntake.current.value
        if (tickerEMIntake === '') return
        let results = processStandardDailyForAlerts(tickerEMIntake)
        try
        {
            const r = await takeInDailyExpectedMovesForAlerts({ expectedMovesForAlerts: results })
            setServerResponseMessage('Updated')
            dailyEMAlertIntake.current.value = ''
        } catch (error)
        {

        }


        console.log(results)
    }
    const [serverResponseMessage, setServerResponseMessage] = useState()

    return (
        <div id='SPYSelectedMacroEMForm'>
            <div id='SPYDaily'>
                <h3>SPY Daily</h3>
                <div>
                    <form onChange={(e) => { e.preventDefault() }} id='dailyEMInputForm'>
                        <div>
                            <label htmlFor="">Call Wall</label>
                            <input type="number" value={selectedData?.callWall.toFixed(2)} />
                            <label htmlFor="">Put Wall</label>
                            <input type="number" value={selectedData?.putWall.toFixed(2)} />
                            <br />
                            <label htmlFor="gammaFlip">Gamma Flip</label>
                            <input type="number" value={selectedData?.gammaFlip.toFixed(2)} id='gammaFlip' />
                        </div>
                        <div>
                            <label htmlFor="">EM Lower</label>
                            <input type="number" value={selectedData?.dailyEM.dailyEMLower} />
                            <label htmlFor="">EM Upper</label>
                            <input type="number" value={selectedData?.dailyEM.dailyEMUpper} />
                        </div>
                        <div>
                            <label htmlFor="">iVol Lower</label>
                            <input type="number" value={selectedData?.dailyEM.iVolDailyEMLower} />
                            <label htmlFor="">iVol Upper</label>
                            <input type="number" value={selectedData?.dailyEM.iVolDailyEMUpper} />
                        </div>
                    </form>
                    <br />
                    <div id='DTEInputAndDisplay'>
                        <form onSubmit={(e) => { e.preventDefault(); addDTEValues(e) }}>
                            <label htmlFor="">DTE Levels</label>
                            <input type="number" id='dteInput' ref={dteInput} />
                            <button type='button' onClick={() => { setDte([]); dteInput.current.focus() }}>Clear All</button>
                        </form>

                        <div>
                            {dte.map((dteValue, i) =>
                                <div className='singleDTEValue' onClick={() => clearSingleDTEValue(i)} >
                                    <p>{dteValue}</p>
                                    <X size={12} color='red' />
                                </div>)}
                        </div>
                    </div>
                </div>
                <button onClick={() => attemptSelectedStockKeyValueUpdate()}>Submit Daily Values</button>
            </div>
            <div id='SPYWeekly'>

                <div>
                    <button onClick={() => setWeekMonthQuarter(0)}>SPY Weekly</button>
                    <button onClick={() => setWeekMonthQuarter(1)}>SPY Monthly</button>
                    <button onClick={() => setWeekMonthQuarter(2)}>SPY Quarterly</button>
                </div>

                {weekMonthQuarter === 0 ?
                    <div>
                        <form onSubmit={(e) => { e.preventDefault(); addWeeklyEMValues(e) }}>
                            <div>
                                <label htmlFor="weeklyClose">Weekly Close</label>
                                <input type="number" step="0.01" id='weeklyClose' />
                                <label htmlFor="weeklyEM">Weekly EM</label>
                                <input type="number" step="0.01" id='weeklySigma' />
                                <label htmlFor="weeklyDate">Date</label>
                                <input type="date" id='weeklyDate' />
                            </div>
                            <button>Add Weekly EM</button>
                        </form>

                        <div className='PreviousWeekEMMoves hide-scrollbar'>
                            {previousWeeklyEM.map((t, i) =>
                            {
                                return (<div className='flex'>
                                    <p>{t.startDate.slice(0, 10)}</p>
                                    <p>{t.upper}</p>
                                    <p>{t.lower}</p>
                                    <button className='buttonIcon' onClick={() => clearSinglePreviousWeeklyEM(i)}><X size={12} /></button>
                                </div>)
                            })}
                        </div>
                        <button onClick={() => submitChanges()}>Submit Weekly</button>
                    </div> :
                    weekMonthQuarter === 1 ?
                        <div>
                            <form onSubmit={(e) => { e.preventDefault(); addWeeklyEMValues(e) }}>
                                <div>
                                    <label htmlFor="">Monthly Close</label>
                                    <input type="number" step="0.01" id='monthlyClose' />
                                    <label htmlFor="">Monthly EM</label>
                                    <input type="number" step="0.01" id='monthlySigma' />
                                    <label htmlFor="monthlyDate">Date</label>
                                    <input type="date" id="monthlyDate" />
                                </div>
                                <button>Add Monthly EM</button>
                            </form>

                            <div className='PreviousMonthEMMoves hide-scrollbar'>
                                {previousMonthlyEM.map((t, i) =>
                                {
                                    return (<div className='flex'>
                                        <p>{new Date(t.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                        <p>{t.upper}</p>
                                        <p>{t.lower}</p>
                                        <button className='buttonIcon' onClick={() => clearSinglePreviousWeeklyEM(i)}><X size={12} /></button>
                                    </div>)
                                })}
                            </div>
                        </div> :
                        <div>
                            Quarter
                        </div>
                }
            </div>
            <div id='EMAlerts'>
                <textarea name="" ref={dailyEMAlertIntake} id="" />
                <button onClick={attemptProcessingOfDailyAlerts}>Update Daily EM For Alerts</button>
                {serverResponseMessage && <p>{serverResponseMessage}</p>}
            </div>
        </div>
    )
}

export default SPYSelectedMacroEM