import { useMemo, useState } from 'react'
import { defaultSectors } from '../../../../../../../Utilities/SectorsAndIndustries'
import { useSelector } from 'react-redux'
import { selectUserMarketSearchFilters } from '../../../../../../../features/Initializations/InitializationSliceApi'

function MarketSearchFilterBar({ searchFilter, setSearchFilter })
{
    const memoizedUserSavedFilters = useMemo(() => selectUserMarketSearchFilters(), [])
    const userSavedFilters = useSelector(memoizedUserSavedFilters)



    const [filterBarOpen, setFilterBarOpen] = useState(false)
    const [filterToSubmit, setFilterToSubmit] = useState(searchFilter)

    function handleFilterValueChange(e) { setFilterToSubmit(prev => ({ ...prev, [e.target.name]: e.target.value === 'Select' ? undefined : e.target.value })) }

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
                <form>
                    <label htmlFor="Sector">Sector</label>
                    <select value={filterToSubmit.Sector} onChange={(e) => handleFilterValueChange(e)} name='Sector' id='Sector'>
                        <option value='Select'>Select</option>
                        {defaultSectors.map((sector) => <option value={sector}>{sector}</option>)}
                    </select>
                    <button type='button' onClick={(e) => handleSubmittingFilterChange(e)}>Search</button>
                </form>

                <select>
                    <option>Select From Saved Filter</option>
                    {userSavedFilters.map((savedFilter, index) => { return <option value={index}>{savedFilter.title}</option> })}
                </select>
                <button>Initiate Saved Filter</button>


                <button onClick={() => setFilterBarOpen(false)}>Filter Bar Closed</button>
            </div>}
        </div>

    )
}

export default MarketSearchFilterBar