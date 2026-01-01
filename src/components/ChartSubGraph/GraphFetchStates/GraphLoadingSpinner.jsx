import './GraphFetchStates.css'

function GraphLoadingSpinner()
{
    return (
        <div className='GraphLoadingSpinner'>
            <div className='spinner'></div>
            <p>Loading Stock Data...</p>
        </div>
    )
}

export default GraphLoadingSpinner