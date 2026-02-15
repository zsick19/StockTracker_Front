import React, { useRef, useState } from 'react'

function WithXShares({ selectedStock })
{
    const xShares = useRef()
    const [withXShares, setWithXShares] = useState(100)


    return (
        <div className='flex'>
            <div>
                <p>With {withXShares} Shares</p>
                <input type="number" ref={xShares} />
                <button onClick={() => setWithXShares(parseInt(xShares.current.value))}>s</button>
            </div>
            <div>

            </div>
            <div>

            </div>

        </div>
    )
}

export default WithXShares