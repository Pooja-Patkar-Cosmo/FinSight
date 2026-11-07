import { Routes, Route, Navigate } from "react-router-dom";

import UserLayout from "./layouts/UserLayout";

import UserDashboard from "./pages/user/UserDashboard";
import Transactions from "./pages/user/Transactions";

function App() {

    return (

        <Routes>

            <Route path="/" element={<UserLayout />}>

                <Route
                    index
                    element={<Navigate to="/dashboard" replace />}
                />

                <Route
                    path="dashboard"
                    element={<UserDashboard />}
                />

                <Route
                    path="transactions"
                    element={<Transactions />}
                />

            </Route>

        </Routes>

    );

}

export default App;