import React from 'react'
import { useConnectionTestQuery } from '../../features/test/testApiSlice'

function HomePage() {

    const {data,isLoading,isSuccess,isError,error,refresh}=useConnectionTestQuery()
    
    if(isError){console.log(error)}
    else{console.log(data)}

  return (
    <div>HomePage</div>
  )
}

export default HomePage