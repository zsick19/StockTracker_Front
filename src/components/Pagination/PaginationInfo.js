export class PaginationInfo
{
    constructor(currentPage, totalResults, resultsPerPage)
    {
        this.currentPage = currentPage
        this.totalResults = totalResults
        this.totalPages = Math.ceil(totalResults / resultsPerPage)
    }

    get hasPrevious() { return this.currentPage > 1 }

    get hasNext() { return this.currentPage < this.totalPages }
}