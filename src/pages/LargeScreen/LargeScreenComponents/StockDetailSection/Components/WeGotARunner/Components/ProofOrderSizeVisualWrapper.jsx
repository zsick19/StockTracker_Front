import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectExitProofById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import OrderSizeVisual from './OrderSizeVisual'
import { ExitProof } from './ExitProof'

function ProofOrderSizeVisualWrapper({ ticker })
{
    const exitProof = useSelector((state) => selectExitProofById(state, ticker))
    const [showHideExitProof, setShowHideExitProof] = useState(true)

    useEffect(() => { if (exitProof) { setShowHideExitProof(true) } }, [exitProof])

    return (<>
        {exitProof ?
            showHideExitProof ? <ExitProof exitProofPayload={exitProof} onClearOverride={setShowHideExitProof} /> : <OrderSizeVisual ticker={ticker} />
            : <OrderSizeVisual ticker={ticker} />}
    </>
    )
}

export default ProofOrderSizeVisualWrapper