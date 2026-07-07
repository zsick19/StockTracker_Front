import React from 'react'

function BaseScoreCard({ baseScoreDetail })
{
    return (
        <div>
            {baseScoreDetail.map((t, i) => <div className='flex'>
                <p>{t.ruleName}</p>
                <p>{t.pointsApplied}</p>
                <p>{t.details}</p>
            </div>)}

        </div>
    )
}

export default BaseScoreCard