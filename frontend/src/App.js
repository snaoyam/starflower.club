import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import React, {useState, useRef} from "react"
import { createTheme } from '@mui/material/styles'
import TopBar from "./topbar"
import Footer from "./footer"
import Home from "./pages/home"
import Login from "./pages/login"
import Register from "./pages/register"
import Member from "./pages/member"
import getSession from "./auth/getsession"
import NotFound from "./pages/notFound"
import Kaistist2021 from "./pages/exhibition/2021kaistist"
import Apply from "./pages/apply"
import Astrophotography from "./pages/astrophotography"
import Exhibition from "./pages/exhibition"
import News from "./pages/news"
import About from "./pages/about"
 

function App() {
  const [session, setSession] = useState(getSession())
  const newSession = () => {
    setSession(getSession())
  }
  const [topBarCss, setTopBarCss] = useState(0.8)
  const divRef = useRef()
  
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

  return (
    <BrowserRouter>
      <div ref={divRef}>
        <TopBar session={session} topBarCss={topBarCss}/>
        <Routes>
          <Route exact path="/" element={<Home setTopBarCss={setTopBarCss} divRef={divRef}/>} />
          <Route exact path="/login" element={session ? <Navigate to="/member" /> : <Login muiTheme={muiTheme} setTopBarCss={setTopBarCss}/>} />
          <Route exact path="/register" element={session ? <Navigate to="/member" /> : <Register muiTheme={muiTheme} setTopBarCss={setTopBarCss}/>} />
          <Route exact path="/member" element={session ? <Member setTopBarCss={setTopBarCss} session={session} newSession={newSession}/> : <Navigate to="/login" />} />
          <Route exact path="/exhibition/2021kaistist" element={<Kaistist2021 />}></Route>
          <Route path="/apply" element={<Apply />}></Route>
          <Route path="/astrophotography" element={<Astrophotography />}></Route>
          <Route path="/exhibition" element={<Exhibition />}></Route>
          <Route path="/news" element={<News />}></Route>
          <Route path="/about" element={<About />}></Route>
          <Route path="*" element={<NotFound />}/>
        </Routes>
        <Routes>
          <Route path="/login" element={<></>} />
          <Route path="/register" element={<></>} />
          <Route path="/member" element={<></>} />
          <Route path="*" element={<Footer />}/>
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App