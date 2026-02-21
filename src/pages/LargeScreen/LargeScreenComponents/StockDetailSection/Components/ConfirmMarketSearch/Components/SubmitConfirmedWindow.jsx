import { X } from 'lucide-react'
import React from 'react'

function SubmitConfirmedWindow({ keepTheseTickers, setShowSubmit, attemptSubmittingConfirmations, submitServerResponse })
{



    return (
        <>
            <div id='SubmitConfirmationWindowUnderlay' onClick={() => setShowSubmit(false)}></div>
            <div id='SubmitConfirmationWindow' >
                <div>
                    <h1>Confirmation Submission</h1>
                    <button className='buttonIcon' onClick={() => setShowSubmit(false)}><X /></button>
                </div>

                <div id='ListOfKeepAndRemove'>
                    <div className='ConfirmationList'>
                        <h4>Remove These Tickers</h4>
                        <div className='hide-scrollbar'>
                            {keepTheseTickers.remove.map((remove) => { return <p>{remove}</p> })}
                        </div>
                    </div>
                    <div className='ConfirmationList'>
                        <h4>Confirm These Tickers</h4>
                        <div className='hide-scrollbar'>
                            {keepTheseTickers.keepInfo.map((keep) => { return <p>{keep.ticker}</p> })}
                        </div>
                    </div>
                </div>
                {submitServerResponse && <div>{submitServerResponse}</div>}

                <button disabled={keepTheseTickers.total === 0} onClick={attemptSubmittingConfirmations}>Submit</button>


            </div>
        </>
    )
}

export default SubmitConfirmedWindow