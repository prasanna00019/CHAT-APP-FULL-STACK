import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { StatusProvider } from './context/StatusContext.jsx'
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthContextProvider>
      <SocketProvider>
        <StatusProvider>
          <App />
        </StatusProvider>
      </SocketProvider>
    </AuthContextProvider>
  </BrowserRouter>

)
