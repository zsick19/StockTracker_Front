import React from 'react'

function AccountAdjustments({ setCurrentSubSection })
{
    return (
        <div>
            Account Adjustments Here
            <button onClick={() => setCurrentSubSection(1)}>hide</button>
        </div>
    )
}

export default AccountAdjustments