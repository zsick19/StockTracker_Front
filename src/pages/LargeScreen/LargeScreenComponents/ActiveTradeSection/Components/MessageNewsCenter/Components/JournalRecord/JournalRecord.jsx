import React, { useEffect, useRef, useState } from 'react'
import './JournalRecord.css'
import { useCreateJournalEntryMutation } from '../../../../../../../../features/Journal/JournalApiSlice'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { selectUsersJournalEntries } from '../../../../../../../../features/Initializations/InitializationSliceApi'

function JournalRecord()
{
    const dispatch = useDispatch()
    const journalEntryRef = useRef()
    const [showJournalRecord, setShowJournalRecord] = useState(false)
    const [serverResponseMessage, setServerResponseMessage] = useState('')
    const [journalEntryCategory, setJournalEntryCategory] = useState('GENERAL')

    const [createJournalEntry] = useCreateJournalEntryMutation()
    async function attemptCreateJournalEntry()
    {
        let journalEntry = journalEntryRef.current.value
        if (journalEntry === '') return
        try
        {
            const results = await createJournalEntry({ journalEntry, journalEntryCategory }).unwrap()
            setServerResponseMessage('Successfully Added Journal Entry')
            setTimeout(() => setServerResponseMessage(''), [2500])
        } catch (error)
        {
            setServerResponseMessage('Error Creating Journal Entry')
        }
    }

    useEffect(() =>
    {
        if (showJournalRecord) journalEntryRef.current.focus()
    }, [showJournalRecord])

    const entries = useSelector(selectUsersJournalEntries())
    console.log(entries)

    return (
        <div id='JournalEntryRecord'>
            {showJournalRecord ?
                <form onSubmit={(e) => { e.preventDefault(); attemptCreateJournalEntry() }} id='JournalEntryForm'>
                    <div>
                        <label htmlFor="journalEntry">Record Journal Entry</label>
                        <textarea name="journalEntry" id="journalEntry" ref={journalEntryRef} onChange={() => setServerResponseMessage('')} />
                    </div>

                    {serverResponseMessage ? serverResponseMessage :
                        <div className='flex'>
                            <label htmlFor="journalEntryCategory">Category</label>
                            <select tabIndex={-1} name="journalEntryCategory" id="journalEntryCategory" onChange={(e) => setJournalEntryCategory(e.target.value)}>
                                <option value="GENERAL">General</option>
                                <option value="MARKET_CONDITIONS">Market Conditions</option>
                                <option value="TRADING_STRATEGY">Trading Strategy</option>
                                <option value="HOLDING_PERIOD">Holding Period</option>
                                <option value="ASSET_CLASS">Asset Class</option>
                                <option value="TECHNICAL_INDICATOR">Technical Indicator</option>
                                <option value="PROFIT_AND_LOSS">Profit And Loss</option>
                                <option value="RISK_REWARD_RATIO">Risk Reward Ratio</option>
                                <option value="ENTRY_TRIGGER">Entry Trigger</option>
                                <option value="EXIT_TRIGGER">Exit Trigger</option>
                                <option value="MISTAKE_LOG">Mistakes</option>
                                <option value="TIME_OF_DAY">Time Of Day</option>
                                <option value="EMOTIONAL_STATE">Emotions</option>
                                <option value="COMMISSION_AND_FEE">Commission & Fees</option>
                            </select>

                            <button >Submit Entry</button>
                            <button type='button' onClick={() => { journalEntryRef.current.value = ''; journalEntryRef.current.focus() }}>Reset</button>
                            <button type='button' onClick={() => setShowJournalRecord(false)}>Cancel</button>
                        </div>
                    }

                </form> : <div>
                    JournalRecord
                    <div>
                        {entries.map((t) =>
                            <div className='flex'>
                                <p>{t.category}</p>
                                <p>{t.entry}</p>
                            </div>
                        )}
                    </div>

                    <button onClick={() => dispatch(setStockDetailState(28))}>View Full Journal</button>
                    <button onClick={() => setShowJournalRecord(true)}>Add Entry</button>
                </div>

            }

            <div>
                Previous exited trades monitor/watch for one extra day
            </div>
        </div>
    )
}

export default JournalRecord