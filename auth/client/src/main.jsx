import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import MyRoutes from './routing/MyRoutes.jsx'
import { Provider } from 'react-redux'
import store from './store/store.js'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}><MyRoutes /></Provider>
  </BrowserRouter>,
)
