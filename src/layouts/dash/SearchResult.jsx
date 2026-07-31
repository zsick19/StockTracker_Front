import React, { useEffect, useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { selectPlanForStaticDetails } from '../../features/Engine/EnginePlanApiSlice';
import { setStockDetailStateWithTicker } from '../../features/SelectedStocks/StockDetailControlSlice';

function SearchResult({ tickerSymbol, handleNavigateClear })
{
    const dispatch = useDispatch()
    const selectStaticFieldsInstance = useMemo(selectPlanForStaticDetails, [])
    const selectedPlannedTicker = useSelector((state) => selectStaticFieldsInstance(state, tickerSymbol), shallowEqual);


    useEffect(() =>
    {

        const handleEnterHit = (event) =>
        {
            if (event.key === 'Enter' && document.activeElement.id === 'centerSearch' && selectedPlannedTicker)
            {
                dispatch(setStockDetailStateWithTicker({ detail: 21, ticker: tickerSymbol }))
                handleNavigateClear()
            }
        }

        window.addEventListener('keydown', handleEnterHit)

        return () => { window.removeEventListener('keydown', handleEnterHit) }
    }, [selectedPlannedTicker])



    return (
        <div className='SearchResultDisplay'>
            {selectedPlannedTicker ? <>
                <h2>{selectedPlannedTicker.id}</h2>


                <button onClick={() => { dispatch(setStockDetailStateWithTicker({ detail: 21, ticker: tickerSymbol })); handleNavigateClear(); }}>
                    Integrated View
                </button>

                <button onClick={() => { dispatch(setStockDetailStateWithTicker({ detail: 22, ticker: tickerSymbol })); handleNavigateClear() }}>
                    Deep Discounts
                </button>


            </>
                :
                <p>No Results</p>
            }
        </div>
    )
}

export default SearchResult