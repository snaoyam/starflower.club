import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import React, {useEffect, useState} from "react"
import {Box} from '@mui/material'
import GatherComponent from "./gather"
import Masonry from '@mui/lab/Masonry'
import {ReactComponent as Cat1} from './cat1.svg'

function Member({setTopBarCss, newSession, session}) {

  useEffect(() => {
    newSession()
    setTopBarCss(0.8)
  }, [])

  return (
    <React.Fragment>
      <Box sx={{'height': '65px'}}></Box>
      <Box sx={{
        'height': '15vh',
        'width': '100%',
        'display': 'flex',
        'alignItems': 'center',
        'color': 'white',
        'margin': 'min(calc(0.6vw + 10px), 30px)',
        'paddingLeft': '40px',
        'fontFamily': 'NanumBarun',
        'fontSize': '40px',
      }}>
        <Box sx={{
          '& > svg': {
            'width': '70px',
            'color': 'white',
            'display': 'block',
            'margin': '0 0 10px 8px',
          },
        }}>
          <Cat1 />
          <span>안녕하세요, {session.name}님!</span>
        </Box>
      </Box>
      <Box sx={{
        'width': '100%',
        'display': 'flex',
        'justifyContent': 'center',
        'padding': 'min(calc(0.6vw + 10px), 30px)',
      }}>
        <Box sx={{ 'width': '65%' }}>
          <Box sx={{
            'width': 'calc(100% - min(calc(0.6vw + 10px), 30px))',
            'height': '280px',
            'overflowX': 'hidden',
          }}>
            <GatherComponent />
          </Box>
          <Box sx={{
            'width': 'calc(100% - min(calc(0.6vw + 10px), 30px))',
            'height': '700px',
            'backgroundColor': 'gray',
            'margin': 'min(calc(0.6vw + 10px), 30px) 0 0 0',
            'borderRadius': '4px',
          }}>
          </Box>
        </Box>
        <Box sx={{ 'width': '35%' }}>
          <Box sx={{
            'width': 'calc(100% - min(calc(1.2vw + 20px), 60px))',
            'height': '500px',
            'backgroundColor': 'gray',
            'borderRadius': '4px',
          }}>
          </Box>
          <Box sx={{
            'width': 'calc(100% - min(calc(1.2vw + 20px), 60px))',
            'height': '250px',
            'backgroundColor': 'gray',
            'margin': 'min(calc(0.6vw + 10px), 30px) 0 0 0',
            'borderRadius': '4px',
          }}>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  )
}

export default Member