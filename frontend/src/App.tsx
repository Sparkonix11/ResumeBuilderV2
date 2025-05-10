import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Auth components
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import PrivateRoute from './components/auth/PrivateRoute'

// Dashboard components
import Dashboard from './components/dashboard/Dashboard'
import ResumePreview from './components/resume/ResumePreview'

// Form components
import PersonalInfoForm from './components/forms/PersonalInfoForm'
import EducationForm from './components/forms/EducationForm'
import ExperienceForm from './components/forms/ExperienceForm'
import ProjectForm from './components/forms/ProjectForm'
import SkillsForm from './components/forms/SkillsForm'
import LinksForm from './components/forms/LinksForm'
import AchievementsForm from './components/forms/AchievementsForm'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
  }

  // Get the base URL for GitHub Pages deployment
  const basename = import.meta.env.MODE === 'production' ? '/ResumeBuilderV2' : ''

  return (
    <Router basename={basename}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />
        } />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Dashboard onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="/resume-preview" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <ResumePreview />
          </PrivateRoute>
        } />
        
        {/* Form routes */}
        <Route path="/forms/personal-info" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <PersonalInfoForm />
          </PrivateRoute>
        } />
        <Route path="/forms/education" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <EducationForm />
          </PrivateRoute>
        } />
        <Route path="/forms/experience" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <ExperienceForm />
          </PrivateRoute>
        } />
        <Route path="/forms/projects" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <ProjectForm />
          </PrivateRoute>
        } />
        <Route path="/forms/skills" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <SkillsForm />
          </PrivateRoute>
        } />
        <Route path="/forms/links" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <LinksForm />
          </PrivateRoute>
        } />
        <Route path="/forms/achievements" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <AchievementsForm />
          </PrivateRoute>
        } />

        {/* Default route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  )
}

export default App
