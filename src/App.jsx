import { Route, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/Public/LandingPage.jsx/LandingPage";
import HomePage from "./pages/HomePage/HomePage";
import PublicLayout from "./layouts/public/PublicLayout";
import DashLayout from "./layouts/dash/DashLayout";
import LargeScreenHomePage from "./pages/LargeScreen/LargeScreenHomePage/LargeScreenHomePage";
import Prefetch from "./features/Prefetch";

function App()
{
  return (
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      <Route path='/dash' element={<DashLayout />}>
        <Route element={<Prefetch />}>

          <Route index element={<HomePage />} />
          <Route path="largeScreen" element={<LargeScreenHomePage />} />
          
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
