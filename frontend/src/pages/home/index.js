import { BrowserRouter, Routes, Route } from "react-router-dom"
import React, {useEffect, useState} from "react"
import Gradient from 'rgt'
import {Box} from '@mui/material'
import { flexbox } from "@mui/system"

function App() {
  return (
    <React.Fragment>
      <Box sx={{
        'position': 'relative',
        'height': '720px',
        'maxHeight': '80vh',
      }}>
        <Box sx={{
          'width': '100%',
          'height': '100%',
          'display': 'flex',
          'justifyContent': 'center',
          'position': 'absolute',
          '& video': {
            'objectFit': 'cover',
            'height': '100%',
            'width': '100%',
          },
          }}>
            <video playsInline autoPlay muted loop src="img/2-4-intro.mp4"></video>
            <Box sx={{
              'position': "absolute",
              'top': '32%',
              'textAlign': 'center',
            }}>
              <Box sx={{
                'fontFamily': 'Nanum',
                'fontWeight': 100,
                'letter-spacing': '10px',
                'color': 'white',
                'fontSize': '20px',
              }}>
                sh
              </Box>
              <Box sx={{
                'marginTop': '20px',
                'font-family': 'Azonix',
                'color': 'white',
                'fontSize': '60px',
              }}>
                Starflower
              </Box>
            </Box>
        </Box>
      </Box>
      asdasdlkjasdk
    </React.Fragment>
  )
}

export default App