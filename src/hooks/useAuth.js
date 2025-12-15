import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";

function useAuth(){
    const credentials=useSelector(selectCurrentUser)

    if(credentials.isLoading) return {isLoading:true, isAuthenticated:false}
    else if(credentials.isAuthenticated) return credentials
    else {return null}
}

export default useAuth;