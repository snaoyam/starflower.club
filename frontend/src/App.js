import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import React, {useState} from "react"
import { createTheme } from '@mui/material/styles'
import TopBar from "./topbar"
import Home from "./pages/home"
import Login from "./pages/login"
import Register from "./pages/register"
import Member from "./pages/member"
import getSession from "./auth/getsession"


function App() {
  const session = getSession()
  const [topBarCss, setTopBarCss] = useState(0.8)
  
  const muiTheme = {
    "textfield": createTheme({
      palette: {
        type: 'light',
        primary: {
          main: '#ffbf2e',
          dark: '#b2209f',
        },
        secondary: {
          main: '#ffe342',
        },
        text: {
          secondary: 'rgba(181,181,181,0.5)',
          disabled: 'rgba(181,181,181,0.6)',
          hint: 'rgba(181,181,181,0.5)',
          primary: 'rgba(255,255,255,0.87)',
        },
        background: {
          default: '#4a4a4a',
        },
        error: {
          main: '#ff5b30',
        },
      }
    }),
    "select": createTheme({
      palette: {
        type: 'light',
        primary: {
          main: '#ffa500',
          dark: '#ffa500',
          contrastText: '#fff',
        },
        text: {
          primary: '#000',
        },
      }
    }),
  }

  const Notfound = <span> 404 Not found </span>

  return (
    <BrowserRouter> 
      <TopBar session={session} topBarCss={topBarCss}/>
      <Routes>
        <Route exact path="/" element={<Home setTopBarCss={setTopBarCss}/>} />
        <Route exact path="/login" element={session ? <Navigate to="/member" /> : <Login muiTheme={muiTheme} setTopBarCss={setTopBarCss}/>} />
        <Route exact path="/register" element={session ? <Navigate to="/member" /> : <Register muiTheme={muiTheme} setTopBarCss={setTopBarCss}/>} />
        <Route exact path="/member" element={session ? <Member setTopBarCss={setTopBarCss}/> : <Navigate to="/login" />} />
        <Route path="*" element={Notfound}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App