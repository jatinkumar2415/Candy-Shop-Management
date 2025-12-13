import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import SweetsList from './pages/SweetsList';
import SweetDetail from './pages/SweetDetail';
import AddSweet from './pages/AddSweet';
import EditSweet from './pages/EditSweet';
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<PrivateRoute><AppWithNavbar /></PrivateRoute>} />
          </Routes>
        </Router>
        <ToastContainer />
      </AuthProvider>
    </ThemeProvider>
  );
}

const AppWithNavbar: React.FC = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<SweetsList />} />
        <Route path="/sweets" element={<SweetsList />} />
        <Route path="/sweets/:id" element={<SweetDetail />} />
        <Route path="/sweets/add" element={<AddSweet />} />
        <Route path="/sweets/:id/edit" element={<EditSweet />} />
      </Routes>
    </>
  );
};

export default App;
