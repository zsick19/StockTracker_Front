import './PaginationFirstLast.css'

function PaginationFirstLast({ paginationInfo, onPageChange })
{
    const getPageNumbers = (paginationInfo) =>
    {
        const pageNumbers = []
        if (paginationInfo.currentPage + 2 < paginationInfo.totalPages)
        {
            for (let i = paginationInfo.currentPage; i <= paginationInfo.currentPage + 2; i++) { pageNumbers.push(i) }
        }
        else { for (let i = paginationInfo.currentPage - 2; i <= paginationInfo.totalPages; i++) { pageNumbers.push(i) } }
        return pageNumbers
    }

    return (
        <nav className='paginationFirstLast'>
            {paginationInfo &&
                <ul className='paginationFirstLast'>
                    <li className={`page-item`}>
                        <button onClick={() => onPageChange(1)} disabled={!paginationInfo.totalPages > 1}>First</button>
                    </li>

                    {getPageNumbers(paginationInfo).map((pageNumber) => (
                        <li key={pageNumber} className={`page-item ${pageNumber === paginationInfo.currentPage ? 'active' : ''}`}>
                            <p className="page-link">{pageNumber}</p>
                        </li>
                    ))}

                    <li className={`page-item`}>
                        <button className="page-link" onClick={() => onPageChange(paginationInfo.totalPages)} disabled={!paginationInfo.hasNext}>
                            Last
                        </button>
                    </li>
                </ul>
            }
        </nav>
    )
}

export default PaginationFirstLast



