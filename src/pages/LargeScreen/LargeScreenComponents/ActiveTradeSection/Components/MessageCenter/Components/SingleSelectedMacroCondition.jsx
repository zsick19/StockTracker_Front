import React from 'react'
import { useFetchUsersMacroWatchListQuery } from '../../../../../../../features/WatchList/WatchListStreamingSliceApi';

function SingleSelectedMacroCondition({ selectedMacro, setSelectedMacro, zoneData })
{
    const { item } = useFetchUsersMacroWatchListQuery(undefined, { selectFromResult: ({ data }) => ({ item: data?.tickerState.entities[selectedMacro] }), });


    return (
        <div>
            {selectedMacro}
            <button onClick={() => setSelectedMacro(undefined)}>clear</button>
        </div>
    )
}

export default SingleSelectedMacroCondition