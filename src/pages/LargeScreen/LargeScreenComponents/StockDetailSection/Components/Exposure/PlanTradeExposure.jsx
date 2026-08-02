import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectExposureResults, selectPlansByMacroIndustry, selectPlansByMacroSector } from '../../../../../../features/Engine/EnginePlanApiSlice'
import { defaultSectors } from '../../../../../../Utilities/SectorsAndIndustries'
import './PlanTradeExposure.css'
import SectorIndustryPieChart from './Components/SectorIndustryPieChart'

function PlanTradeExposure()
{
    const [displayPieOrChart, setDisplayPieOrChart] = useState({ display: true, ticker: undefined })

    const [sectorFilter, setSectorFilter] = useState('all')
    const [industryFilter, setIndustryFilter] = useState('all')
    const [industryHover, setIndustryHover] = useState(undefined)
    const [sectorHover, setSectorHover] = useState(undefined)

    const exposure = useSelector(selectExposureResults)
    const sector = useSelector((state) => selectPlansByMacroSector(state, sectorFilter))
    const industry = useSelector((state) => selectPlansByMacroIndustry(state, industryFilter))

    return (
        <div id='ExposureBreakDown'>
            <div id='ExposureChartAndSectorSelect'>
                {displayPieOrChart.display ? <SectorIndustryPieChart dataToDisplay={sectorHover ? exposure.industryExposure[sectorHover] :
                    sectorFilter !== 'all' ? exposure.industryExposure[sectorFilter] : exposure.sectorExposure} isSector={sectorHover === undefined} />
                    :
                    <div>
                        sector chart
                        <button onClick={() => setDisplayPieOrChart({ display: true, ticker: undefined })}>clear</button>
                    </div>
                }
                <div id='SectorSelectors'>
                    {defaultSectors.map((t) => <div onMouseEnter={() => setSectorHover(t)} onMouseLeave={() => setSectorHover(undefined)}>
                        <p style={{ backgroundColor: `${sectorFilter === t ? 'blue' : ''}` }} onClick={() => setSectorFilter(t)} onContextMenu={(e) => { e.preventDefault(); setDisplayPieOrChart({ display: false, ticker: t }) }}>{t}</p>
                    </div>)}
                    <button onClick={() => { setSectorFilter('all'); setIndustryFilter('all'); setSectorHover(undefined); setIndustryHover(undefined) }}>Clear</button>
                </div>
            </div>


            <div id='ExposureTickersOfSelected'>
                {sectorFilter !== 'all' ?
                    <div id='IndustrySelectors'>
                        <button style={{ backgroundColor: `${industryFilter === 'all' ? 'blue' : ''}` }} onClick={() => setIndustryFilter('all')}>All</button>
                        {Object.entries(exposure.industryExposure[sectorFilter]).map(([Key, value]) => <button
                            style={{ backgroundColor: `${industryFilter === Key ? 'blue' : ''}` }}
                            onMouseEnter={() => setIndustryHover(Key)}
                            onMouseLeave={() => setIndustryHover(undefined)}
                            onClick={() => setIndustryFilter(Key)}>{Key}</button>)}
                    </div> :
                    <div>
                        <button style={{ backgroundColor: `${industryFilter === 'all' ? 'blue' : ''}` }} onClick={() => setIndustryFilter('all')}>All</button>
                    </div>}
                <div id='IndustrySectorGroup' className='hide-scrollbar'>
                    {industry.length ?
                        industry.map((t) => <div className='singleIndustrySector' style={{ backgroundColor: `${industryHover === t.stockInfo.Industry ? 'blue' : ''}` }} >{t.id}</div>) :
                        sector.map((t) => <div className='singleIndustrySector' style={{
                            backgroundColor: `${sectorHover === t.stockInfo?.Sector ? 'blue' :
                                industryHover === t.stockInfo.Industry ? 'blue' :
                                    ''}`
                        }}>{t.id}</div>)
                    }
                </div>
            </div>
        </div>
    )
}

export default PlanTradeExposure