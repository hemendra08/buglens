import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const token = useAuthStore((state) => state.token)

  // Simple auth routing
  if (!token) {
    return <Login />
  }

  return <Dashboard />
}

export default App
