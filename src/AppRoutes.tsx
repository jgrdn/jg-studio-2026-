import { Route, Routes } from 'react-router-dom'
import { PageTransitionLayout } from './components/PageTransitionLayout'
import { HomePage } from './pages/HomePage'
import { ArchivePage } from './pages/ArchivePage'
import { ProjectPage } from './pages/ProjectPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PageTransitionLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/work/archive" element={<ArchivePage />} />
        <Route path="/work/:slug" element={<ProjectPage />} />
      </Route>
    </Routes>
  )
}

