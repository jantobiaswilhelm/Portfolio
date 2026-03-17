import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import HubPage from './pages/HubPage'
import WorkPage from './pages/WorkPage'
import PhotographyPage from './pages/PhotographyPage'
import AboutPage from './pages/AboutPage'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HubPage />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/photography" element={<PhotographyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
