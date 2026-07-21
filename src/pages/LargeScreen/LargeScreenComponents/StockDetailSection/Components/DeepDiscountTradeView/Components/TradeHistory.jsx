import { format } from 'date-fns'
import React from 'react'

function TradeHistory({ tradeHistory })
{

    //  {
    //       T: 't',
    //       Symbol: 'ADCT',
    //       ID: 52983879850300,
    //       Exchange: 'V',
    //       Price: 1.285,
    //       Size: 200,
    //       Conditions: [ ' ' ],
    //       Tape: 'A',
    //       Timestamp: '2026-07-16T19:20:04.294Z'
    //     }

    return (
        <div>
            TradeHistory: {tradeHistory.length}
            <div className='hide-scrollbar' style={{ height: '150px', width: '200px', overflowY: 'scroll', fontSize: 'var(--fs-100)' }}>
                {tradeHistory.map((t) => <div className='flex'>
                    <p>{t.Price}</p>
                    <p>{t.Size}</p>
                    <p>{format(t.Timestamp, "HH:mm:ss")}</p>
                </div>)}
            </div>
        </div>
    )
}

export default TradeHistory