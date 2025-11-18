import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import GroupsPage from './pages/GroupsPage';
import ScorecardPage from './pages/ScorecardPage';
import StatsPage from './pages/StatsPage';
import NotificationsPage from './pages/NotificationsPage';
import OrganizerPage from './pages/OrganizerPage';
import HeadOrganizerPage from './pages/HeadOrganizerPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EventsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/groups"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GroupsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/scorecard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ScorecardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StatsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotificationsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/organizer"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrganizerPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/head-organizer"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HeadOrganizerPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AdminPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
