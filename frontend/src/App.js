import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ProtectedRoute, TempProtectedRoute } from "./components/ProtectedRoute";//this will check where token is there or not if not redirect back

import SelectRole from './components/SelectRole'; 
import DriverLogin from './components/DriverLogin';
import UserLogin from './components/UserLogin';
import DriverSignup from './components/DriverSignup';
import UserSignup from './components/UserSignup';
import HomePage from './components/HomePage';
import ChangePassword from './components/ChangePassword';

import SecurityLogin from './components2/SecurityLogin.js';
import SecuritySignup from './components2/SecuritySignup';
import SecurityAddUser from './components2/SecurityAddUser.js';
import TempUserHome from './components2/TempUserHome';
import TempUserLoading from './components2/TempUserLoading';
import SecurityMap from './components2/SecurityMap';
import ManageUser from './components2/ManageUser';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectRole />} />
        <Route path="/driverlogin" element={<DriverLogin />} />
        <Route path="/userlogin" element={<UserLogin />} />
        <Route path="/driversignup" element={<DriverSignup />} />
        <Route path="/usersignup" element={<UserSignup />} />
        <Route path="/home" element={ <ProtectedRoute>
                                                <HomePage />
                                      </ProtectedRoute>} />
        <Route path="/changepassword" element={<ProtectedRoute>
                                                    <ChangePassword />
                                                </ProtectedRoute>} />

        <Route path="/securitylogin" element={<SecurityLogin />} />
        <Route path="/securitysignup" element={<SecuritySignup />}/>
        <Route path="/adduser" element={<ProtectedRoute><SecurityAddUser /></ProtectedRoute>} />
        <Route path="/tempuserloading" element={<TempUserLoading />} />
        <Route path="/tempuserhome" element={<TempUserHome />} />
        <Route path="/securitymap" element={<ProtectedRoute><SecurityMap /></ProtectedRoute>} />
        <Route path="/manageuser" element={<ProtectedRoute><ManageUser /></ProtectedRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
