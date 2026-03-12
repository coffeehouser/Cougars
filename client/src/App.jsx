import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import Home from './components/common/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CreateCharacter from './components/character/CreateCharacter';
import EditCharacter from './components/character/EditCharacter';
import CharacterProfile from './components/character/CharacterProfile';
import MyCharacters from './components/character/MyCharacters';
import AlbumView from './pages/AlbumView';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public character routes */}
              <Route path="/character/:id" element={<CharacterProfile />} />
              <Route path="/album/:id" element={<AlbumView />} />

              {/* Protected routes */}
              <Route
                path="/my-characters"
                element={
                  <PrivateRoute>
                    <MyCharacters />
                  </PrivateRoute>
                }
              />
              <Route
                path="/character/create"
                element={
                  <PrivateRoute>
                    <CreateCharacter />
                  </PrivateRoute>
                }
              />
              <Route
                path="/character/:id/edit"
                element={
                  <PrivateRoute>
                    <EditCharacter />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
