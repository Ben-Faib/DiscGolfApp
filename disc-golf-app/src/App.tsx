import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Pages (simplified - player demo only)
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import ScorecardPage from './pages/ScorecardPage';
import StatsPage from './pages/StatsPage';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <DashboardPage />
                </Layout>
              }
            />
            
            <Route
              path="/events"
              element={
                <Layout>
                  <EventsPage />
                </Layout>
              }
            />
            
            <Route
              path="/scorecard"
              element={
                <Layout>
                  <ScorecardPage />
                </Layout>
              }
            />
            
            <Route
              path="/scorecard/:scorecardId"
              element={
                <Layout>
                  <ScorecardPage />
                </Layout>
              }
            />
            
            <Route
              path="/stats"
              element={
                <Layout>
                  <StatsPage />
                </Layout>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
