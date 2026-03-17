import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'

const HubPage = lazy(() => import('./pages/HubPage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const PhotographyPage = lazy(() => import('./pages/PhotographyPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-darkest" />}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HubPage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/photography" element={<PhotographyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
