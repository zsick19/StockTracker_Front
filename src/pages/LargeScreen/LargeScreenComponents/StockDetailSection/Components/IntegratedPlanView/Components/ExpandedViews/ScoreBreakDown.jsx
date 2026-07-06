import React from 'react'

function ScoreBreakDown({ plan, scoreCardView, setScoreCardView })
{
    const auditLedger = plan.centralScoreProfile.auditLedger
    console.log(auditLedger.BASE)
    function provideCurrentScoreCardView()
    {
        switch (scoreCardView)
        {

            case 0: return <div>overall score</div>
            case 1: return <div>

                {auditLedger.BASE.map((t, i) =>
                    <div className='flex'>
                        <p>{t.ruleName}</p>
                        <p>{t.pointsApplied}</p>
                        <p>{t.details}</p>
                    </div>
                )}

            </div>
            case 2: return <div>Time</div>
            case 3: return <div>Strategy</div>
            case 4: return <div>Penalties</div>
        }
    }

    return (
        <div id='ScoreCardVisual'>
            {provideCurrentScoreCardView()}
            <div>
                <button onClick={() => setScoreCardView(0)}>Over All</button>
                <button onClick={() => setScoreCardView(1)}>Base Score</button>
                <button onClick={() => setScoreCardView(2)}>Time Score</button>
                <button onClick={() => setScoreCardView(3)}>Strategy Score</button>
                <button onClick={() => setScoreCardView(4)}>Penalties</button>
            </div>
        </div>
    )
}

export default ScoreBreakDown