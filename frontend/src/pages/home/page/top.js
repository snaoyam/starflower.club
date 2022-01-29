import { BrowserRouter, Routes, Route } from "react-router-dom"
import React, {useEffect, useState} from "react"
import Gradient from 'rgt'
import {Box} from '@mui/material'

function Top() {
  return (
    <React.Fragment>
      <Box sx={{
        'position': 'relative',
        'height': '100vh',
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
              'top': '38%',
              'textAlign': 'center',
            }}>
              <Box sx={{
                'fontFamily': 'Nanum',
                'fontWeight': 100,
                'letterSpacing': '10px',
                'color': 'white',
                'fontSize': '20px',
              }}>
                KAIST 천체관측 동아리
              </Box>
              <Box sx={{
                'marginTop': '20px',
                'fontFamily': 'Azonix',
                'color': 'white',
                'fontSize': '60px',
              }}>
                Starflower
              </Box>
            </Box>
        </Box>
      </Box>
    </React.Fragment>
  )
}

export default Top