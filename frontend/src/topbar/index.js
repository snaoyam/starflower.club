import React, {useEffect} from "react"
import { Link } from "react-router-dom"
import {Box} from '@mui/material'
import {css} from '@emotion/css'
import Login from "./components/login_btn"


const Topbar = ({session, topBarCss}) => {
  useEffect(() => {
    setTimeout(()=>{
      document.getElementById('SFHome').style.transition = 'opacity 0.3s'
     }, 50)
  }, [])
  
  return (
    <Box sx={{
      'WebkitTouchCallout': 'none',
      'WebkitUserSelect': 'none',
      'KhtmlUserSelect': 'none',
      'MozUserSelect': 'none',
      'msUserSelect': 'none',
      'userSelect': 'none',
      'fontFamily': 'Mapo',
      'position': 'fixed',
      'top': 0, 'right': 0,
      'height': '65px',
      'width': 'calc(100% - min(6vw, 60px))',
      'display': 'flex',
      'flexDirection': 'row',
      'alignItems': 'center',
      'backgroundColor': `rgba(2,2,2,${topBarCss})`,
      'boxShadow': `0 1px 10px rgba(0,0,0,${0.5*topBarCss})`,
      'zIndex': 10,
      'padding': '0 min(3vw, 30px)',
      'transitionProperty': 'backdrop-filter, background, -webkit-backdrop-filter, box-shadow, background-color',
      'transitionDuration': '0.4s, 0.4s, 0.4s, 0.4s, 0.4s',
      'transitionTimingFunction': 'ease, ease, ease, ease, ease',
      'transitionDelay': '0s, 0s, 0s, 0s, 0s',
      '& > a' : {
        'pointer': topBarCss === 0 ? 'unset' : 'unset',
      },
    }}>
      <Link to="/" id="SFHomep" style={topBarCss === 0 ? {pointerEvents: "none"} : null}>
        <Box id="SFHome" sx={{
          'height': '100%',
          'padding': '0 10px',
          'display': 'flex',
          'alignItems': 'center',
          'justifyContent': 'center',
          'opacity': topBarCss === 0 ? 0 : 1,
          '& > span': {
            'color': 'rgb(255, 226, 66)',
            'fontSize': 'min(5vw, 20px)',
          }
        }}>
          <span>STARFLOWER</span>
        </Box>
      </Link>
      <Login session={session}/>
    </Box>
  )
}

export default Topbar
