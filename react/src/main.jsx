import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import MyRouters from './Router/index.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MyRouters />
  </BrowserRouter>,
)
