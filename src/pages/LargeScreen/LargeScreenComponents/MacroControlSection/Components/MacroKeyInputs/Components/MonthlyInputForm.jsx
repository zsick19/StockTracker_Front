import React from 'react'

function MonthlyInputForm({ setSelectedData, selectedData })
{
    return (
        <div id='KeyMonthQuarterYearFormInputs'>
            <h2>Monthly/Quarterly/Yearly</h2>
            <div className='flex'>
                <div>
                    <label htmlFor="monthUpperEM">Month's Upper EM </label>
                    <input type="number" id='monthUpperEM' value={selectedData?.monthlyEM?.monthUpperEM} onChange={(e) => setSelectedData(prev => ({ ...prev, monthlyEM: { ...prev.monthlyEM, monthUpperEM: parseFloat(e.target.value) } }))} />
                </div>
                <div>
                    <label htmlFor="monthLowerEM">Month's Lower EM </label>
                    <input type="number" id='monthLowerEM' value={selectedData?.monthlyEM?.monthLowerEM} onChange={(e) => setSelectedData(prev => ({ ...prev, monthlyEM: { ...prev.monthlyEM, monthLowerEM: parseFloat(e.target.value) } }))} />
                </div>
                <div>
                    <label htmlFor="quarterUpperEM">Quarter's Upper EM </label>
                    <input type="number" id='quarterUpperEM' />
                </div>
                <div>
                    <label htmlFor="quarterLowerEM">Quarter's Lower EM </label>
                    <input type="number" id='quarterLowerEM' />
                </div>
                <div>
                    <label htmlFor="yearlyUpperEM">Yearly Upper EM </label>
                    <input type="number" id='yearlyUpperEM' />
                </div>
                <div>
                    <label htmlFor="yearlyLowerEM">Yearly Lower EM </label>
                    <input type="number" id='yearlyLowerEM' />
                </div>
            </div>
        </div>
    )
}

export default MonthlyInputForm