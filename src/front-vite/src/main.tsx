import React from 'react'
import ReactDOM from 'react-dom/client'
import MainAppComponent from './MainAppComponent.tsx'
import './main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MainAppComponent />
  </React.StrictMode>,
)
