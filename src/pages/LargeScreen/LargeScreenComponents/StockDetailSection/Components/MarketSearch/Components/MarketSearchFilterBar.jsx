import { useMemo, useRef, useState } from 'react'
import { defaultSectors } from '../../../../../../../Utilities/SectorsAndIndustries'
import { useSelector } from 'react-redux'
import { selectUserMarketSearchFilters } from '../../../../../../../features/Initializations/InitializationSliceApi'
import { useCreateNewSavedFilterMutation } from '../../../../../../../features/MarketSearch/MarketSearchFilterSliceApi'

function MarketSearchFilterBar({ searchFilter, setSearchFilter })
{
    const titleForSavingFilter = useRef()
    const memoizedUserSavedFilters = useMemo(() => selectUserMarketSearchFilters(), [])
    const userSavedFilters = useSelector(memoizedUserSavedFilters)

    const [filterToSubmit, setFilterToSubmit] = useState(searchFilter)
    const [displayFilterSave, setDisplayFilterSave] = useState(false)
    const [filterBarOpen, setFilterBarOpen] = useState(false)
    const [savedFilterServerMessage, setSavedFilterServerMessage] = useState(undefined)

    const [createNewSavedFilter, { isSuccess, isLoading, isError, error }] = useCreateNewSavedFilterMutation()

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

    function handleUserSavedFilterSelection(e)
    {
        if (e.target.value === '-1') { setFilterToSubmit(searchFilter) }
        else
        {
            let filterIndex = parseInt(e.target.value)
            setFilterToSubmit(userSavedFilters[filterIndex].filterParams)
        }
    }

    function handleFilterValueChange(e)
    {
        setFilterToSubmit(prev => ({ ...prev, [e.target.name]: e.target.value === 'Select' ? undefined : e.target.value }))
    }

    function handleSubmittingFilterChange()
    {
        setSearchFilter(filterToSubmit)
        setFilterBarOpen(false)
    }

    return (
        <div id='LHS-MarketSearchFilterBarClosed'>
            <p>Filter Info</p>
            <button onClick={() => setFilterBarOpen(true)}>Open Filter</button>
            <form>
                <label htmlFor="ResultsPerPage">Results Per Page</label>
                <select id='ResultsPerPage'>
                    <option>9</option>
                    <option>4</option>
                </select>
            </form>

            {filterBarOpen && <div id='LHS-MarketSearchFilterBarOpen'>
                <h3>Filter</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="Sector">Sector</label>
                    <select value={filterToSubmit.Sector} onChange={(e) => handleFilterValueChange(e)} name='Sector' id='Sector'>
                        <option value='Select'>Select</option>
                        {defaultSectors.map((sector) => <option value={sector}>{sector}</option>)}
                    </select>


                    {!displayFilterSave &&
                        <div>
                            <button type='button' onClick={(e) => handleSubmittingFilterChange(e)}>Search</button>
                            <button type='button' onClick={() => setDisplayFilterSave(true)}>Save Filter</button>
                        </div>
                    }
                </form>

                {displayFilterSave &&
                    <form onSubmit={(e) => e.preventDefault()}>
                        <label htmlFor="filterTitle">Filter Title</label>
                        <input type="text" id='filterTitle' ref={titleForSavingFilter} />
                        <button type='button' onClick={() => attemptToSaveFilter()}>Save and Search</button>
                        <button type='button' onClick={() => setDisplayFilterSave(false)}>Cancel</button>
                        <p>{savedFilterServerMessage}</p>
                    </form>
                }


                <select onChange={handleUserSavedFilterSelection}>
                    <option value={-1}>Select From Saved Filter</option>
                    {userSavedFilters.map((savedFilter, index) => { return <option value={index}>{savedFilter.title}</option> })}
                </select>


                <button onClick={() => { setDisplayFilterSave(false); setSavedFilterServerMessage(undefined); setFilterBarOpen(false) }}>Filter Bar Closed</button>
            </div>}
        </div>

    )
}

export default MarketSearchFilterBar