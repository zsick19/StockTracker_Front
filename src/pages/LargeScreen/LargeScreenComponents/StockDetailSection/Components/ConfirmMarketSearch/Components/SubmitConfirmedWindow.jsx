import React from 'react'

function SubmitConfirmedWindow({ keepTheseTickers, setShowSubmit, attemptSubmittingConfirmations, submitServerResponse })
{



    return (
        <div id='SubmitConfirmationWindow'>
            <h1>Confirmation Submission</h1>
            <div>
                <div className='ConfirmationList'>
                    <h4>Confirm These Tickers</h4>
                    <div className='hide-scrollbar'>
                        {keepTheseTickers.keep.map((keep) => { return <p>{keep}</p> })}
                    </div>
                </div>
                <div className='ConfirmationList'>
                    <h4>Remove These Tickers</h4>
                    <div className='hide-scrollbar'>
                        {keepTheseTickers.remove.map((remove) => { return <p>{remove}</p> })}
                    </div>
                </div>
            </div>
            {submitServerResponse && <div>
                {submitServerResponse}
            </div>}
            <button disabled={keepTheseTickers.total === 0} onClick={attemptSubmittingConfirmations}>Submit</button>
            <button onClick={() => setShowSubmit(false)}>Close</button>
        </div>
    )
}

export default SubmitConfirmedWindow