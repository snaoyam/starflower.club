import React, {useEffect, useState} from "react"
import {Box} from '@mui/material'

function Top({page}) {
  return (
    <React.Fragment>
      <Box sx={{
        'position': 'relative',
        'height': '100vh',
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
        '-khtml-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none',
        'user-select': 'none',
        'opacity': page === 1 ? 0 : 1,
        'transition': page === 1 ? 'opacity 1s' : '',
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
                'letterSpacing': 'min(2.5vw, 10px)',
                'color': 'white',
                'fontSize': 'min(4vw, 20px)',
              }}>
                KAIST 천체관측 동아리
              </Box>
              <Box sx={{
                'marginTop': '20px',
                'fontFamily': 'Azonix',
                'color': 'rgb(255, 226, 66)',
                'fontSize': 'min(12vw, 60px)',
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