import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import HomePage from "./pages/HomePagePage";
import ControlsPage from "./pages/ControlsPage";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Profile } from "./pages/Profile";
import AvatarsPage from "./pages/AvatarsPage";
import ArenaPage from "./pages/ArenaPage";

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />

            <Route
              path="/arena"
              element={
                <ProtectedRoute>
                  <ArenaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/controls"
              element={
                <ProtectedRoute>
                  <ControlsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/avatars"
              element={
                <ProtectedRoute>
                  <AvatarsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<h1>Not Found</h1>} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
