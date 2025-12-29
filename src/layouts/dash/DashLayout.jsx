import useAuth from "../../hooks/useAuth";
import DashNav from "./DashNav";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import "../dash/DashLayoutNav.css";

function DashLayout() {
  const { ...userStatus } = useAuth();
  const location = useLocation();

  if (userStatus === null) {
    return (
      <Navigate to={"/login"} replace state={{ from: location.pathname }} />
    );
  }

  if (userStatus.isLoading) {
    return <div>Loading authentication status...</div>;
  }

  return userStatus.isAuthenticated ? (
    <>
      <DashNav />
      <div id="LayoutContainer">
        <Outlet />
      </div>
    </>
  ) : (
    <Navigate to={"/login"} replace state={{ from: location.pathname }} />
  );
}

export default DashLayout;
