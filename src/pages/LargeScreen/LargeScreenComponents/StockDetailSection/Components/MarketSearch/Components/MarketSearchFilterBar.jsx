import { useMemo, useRef, useState } from 'react'
import { defaultSectors } from '../../../../../../../Utilities/SectorsAndIndustries'
import { useSelector } from 'react-redux'
import { selectUserMarketSearchFilters } from '../../../../../../../features/Initializations/InitializationSliceApi'
import { useCreateNewSavedFilterMutation, useRemoveSavedFilterMutation } from '../../../../../../../features/MarketSearch/MarketSearchFilterSliceApi'
import { ChevronDown, CircleX, PanelTopOpen } from 'lucide-react'

function MarketSearchFilterBar({ searchFilter, setSearchFilter })
{
    const titleForSavingFilter = useRef()


    const [createNewSavedFilter, { isSuccess, isLoading, isError, error }] = useCreateNewSavedFilterMutation()
    const [removeSavedFilter, { isSuccess: removalSuccess }] = useRemoveSavedFilterMutation()
    const memoizedUserSavedFilters = useMemo(() => selectUserMarketSearchFilters(), [removeSavedFilter, createNewSavedFilter])
    const userSavedFilters = useSelector(memoizedUserSavedFilters)


    const [filterToSubmit, setFilterToSubmit] = useState(searchFilter)
    const [displayFilterSave, setDisplayFilterSave] = useState(false)
    const [filterBarOpen, setFilterBarOpen] = useState(false)
    const [savedFilterServerMessage, setSavedFilterServerMessage] = useState(undefined)


    async function attemptToSaveFilter()
    {
        let title = titleForSavingFilter.current.value

        if (title === '')
        {
            setSavedFilterServerMessage('Provide Title For Filter')
            return
        }

        let duplicateTitle
        userSavedFilters.map((filter) =>
        {
            if (filter.title === title)
            {
                duplicateTitle = true
                return
            }
        })
        if (duplicateTitle)
        {
            setSavedFilterServerMessage('Title Already Exists')
            return
        }

        try
        {
            const result = await createNewSavedFilter({ title, filterParams: { ...filterToSubmit } })
            setSavedFilterServerMessage('Success! Filter created. Initiating search...')
            setTimeout(() =>
            {
                handleSubmittingFilterChange()
            }, [2000])

        } catch (error)
        {
            setSavedFilterServerMessage('Error Saving Filter')
            console.log(error)
        }
    }

    async function attemptToRemoveSavedFilter(e, index)
    {
        e.stopPropagation()
        try
        {
            const results = await removeSavedFilter({ index, filterToRemove: userSavedFilters[index] })
            setSavedFilterServerMessage('Filter Removed')
        } catch (error)
        {
            console.log(error)
        }

    }

    function handleUserSavedFilterSelection(index)
    {
        setFilterToSubmit(userSavedFilters[index].filterParams)
    }

    function handleFilterValueChange(e)
    {
        setFilterToSubmit(prev => ({ ...prev, [e.target.name]: e.target.value === 'Select' ? undefined : e.target.value }))
    }

    function handleSubmittingFilterChange()
    {
        setSearchFilter(filterToSubmit)
        setFilterBarOpen(false)
        setDisplayFilterSave(false)
        setSavedFilterServerMessage(undefined)
    }


    const hasFilter = searchFilter.Sector || searchFilter.Industry || searchFilter.MarketCap || searchFilter.AvgVolume || searchFilter.ATR || searchFilter.Country

    return (
        <div id='LHS-MarketSearchFilterBarClosed' onClick={() => setFilterBarOpen(true)}>
            {hasFilter ?
                <div className='currentFilters' >
                    {searchFilter.Sector && <p>Sector: {searchFilter.Sector}</p>}
                    {searchFilter.Industry && <p>Industry: {searchFilter.Industry}</p>}
                    {searchFilter.MarketCap && <p>Market Cap: {searchFilter.MarketCap}</p>}
                    {searchFilter.AvgVolume && <p>Avg Volume: {searchFilter.AvgVolume}</p>}
                    {searchFilter.Country && <p>Country: {searchFilter.Country}</p>}
                    {searchFilter.ATR && <p>ATR: {searchFilter.ATR}</p>}
                </div> :
                <p>{'Search Filter'}</p>
            }

            {filterBarOpen &&
                <div id='LHS-MarketSearchFilterBarOpen' onClick={(e) => e.stopPropagation()}>
                    <div id='LHS-FilterOptions'>
                        <h3>Filter</h3>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="Sector">Sector</label>
                            <select value={filterToSubmit.Sector} onChange={(e) => handleFilterValueChange(e)} name='Sector' id='Sector'>
                                <option value='Select'>Select</option>
                                {defaultSectors.map((sector) => <option value={sector}>{sector}</option>)}
                            </select>

                            <button type='button' onClick={(e) => handleSubmittingFilterChange(e)}>Search</button>

                            {!displayFilterSave && <div>

                            </div>}
                        </form>
                    </div>


                    <div id='LHS-UserSavedFilters'>
                        <h4>User Saved Filters</h4>
                        <div>

                            {userSavedFilters.map((savedFilter, index) =>
                            {
                                return <div onClick={() => handleUserSavedFilterSelection(index)} className='flex'>
                                    <p>{savedFilter.title}</p>
                                    <button onClick={(e) => attemptToRemoveSavedFilter(e, index)}>Remove</button>
                                </div>
                            })}
                            <p>Click to Load Filter</p>
                        </div>
                        <br />
                        <form onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="filterTitle">Save This Filter</label>
                            <input type="text" id='filterTitle' ref={titleForSavingFilter} />
                            <button type='button' onClick={() => attemptToSaveFilter()}>Save and Search</button>
                            <button type='button' onClick={() => setDisplayFilterSave(false)}>Cancel</button>
                            <p>{savedFilterServerMessage}</p>
                        </form>
                    </div>
                    <div>
                        <button className='buttonIcon' onClick={() =>
                        {
                            setDisplayFilterSave(false); setSavedFilterServerMessage(undefined); setFilterBarOpen(false)

                        }}><CircleX color='white' /></button>
                    </div>
                </div>}

        </div>
    )
}

export default MarketSearchFilterBar