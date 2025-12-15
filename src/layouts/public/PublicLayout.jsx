import PublicNav from './PublicNav'
import {Outlet} from 'react-router-dom'

function PublicLayout() {
  return (
    <>
        <PublicNav/>
        <div>
            <Outlet/>
        </div>
    </>
  )
}

export default PublicLayout