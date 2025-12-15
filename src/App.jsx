import { Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/Public/LandingPage.jsx/LandingPage'
import HomePage from './pages/HomePage/HomePage'
import PublicLayout from './layouts/public/PublicLayout'
import DashLayout from './layouts/dash/DashLayout'

function App() {

  return (
    <Routes>
      <Route path='/' element={<PublicLayout/>}>
        <Route index element={<LandingPage/>}/>
      </Route>

      <Route path='/dash' element={<DashLayout/>}>
        <Route index element={<HomePage/>}/>
      </Route>   
    </Routes>
  )
}

export default App
