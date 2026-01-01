import './GraphFetchStates.css'

function GraphLoadingError({ refetch })
{
    return (
        <div className='GraphLoadingError'>
            <p>Error Loading Data :(</p>
            <button onClick={refetch}>Refetch Data</button>
        </div>
    )
}

export default GraphLoadingError