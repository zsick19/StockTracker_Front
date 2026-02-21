import React, { useState } from 'react'
import { confirmedStatuses } from '../../../../../../../Utilities/ConfirmedStatuses';
import { ArrowBigRight, Trash2, X } from 'lucide-react';

function SingleConfirmedTR({ confirmed, jumpToChart, attemptRemovingConfirmed, selectedConfirmed, setSelectedConfirmed })
{
    let confirmedStatus = confirmed.status >= 0 ? confirmedStatuses[confirmed.status] : 'Quick Add'
    const [showDoubleCheckRemove, setShowDoubleCheckRemove] = useState(false)


    return (
        <tr className={`ConfirmedTableRow ${confirmedStatus}`} id={confirmed.tickerSymbol === selectedConfirmed?.tickerSymbol ? 'selected' : ''}
            onClick={() => setSelectedConfirmed(confirmed)}>
            <td>{confirmed.tickerSymbol}</td>
            <td>{confirmed.sector}</td>
            <td>{confirmedStatus}</td>
            <td>{new Date(confirmed.dateAdded).toLocaleDateString()}</td>
            {showDoubleCheckRemove ?
                <td className='doubleConfirmTrashAndX' onClick={(e) => e.stopPropagation()}>
                    <button className='buttonIcon'>
                        <Trash2 onClick={() => attemptRemovingConfirmed(confirmed)} size={16} color='red' />
                    </button>

                    <button className='buttonIcon'>
                        <X onClick={() => setShowDoubleCheckRemove(false)} size={16} color='blue' />
                    </button>
                </td> :
                <td onClick={(e) => e.stopPropagation()}>
                    {confirmedStatus === 'Traded' ? '-' : <button onClick={() => setShowDoubleCheckRemove(true)} className='buttonIcon'><Trash2 size={16} /></button>}
                </td>
            }
            <td><button className='buttonIcon'><ArrowBigRight size={16} onClick={(e) => { e.stopPropagation(); jumpToChart(confirmed) }} /></button></td>
        </tr>
    )
}

export default SingleConfirmedTR