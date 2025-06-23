
// import { Navigate } from "react-router-dom";
// import { useAuthStore } from "../store/auth";
// import { showToast } from "../utils/toast";
// const PrivateRoute = ({children}) => {
//     const loggedIn = useAuthStore((state) => state.isLoggedIn)()

//     return (loggedIn ? <>{children}</> : <Navigate to='/login' />)
// }

// export default PrivateRoute

import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/auth";
import { showToast } from "../utils/toast";

const PrivateRoute = ({ children }) => {
    const loggedIn = useAuthStore((state) => state.isLoggedIn)();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        if (!loggedIn) {
            showToast('warning', 'Please Login');
            setShouldRedirect(true);
        }
    }, [loggedIn]);

    if (shouldRedirect) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
