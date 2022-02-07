import React, {useEffect, useRef} from "react"
import {Box} from '@mui/material'
import Video from './video'

function Top({page}) {

  const videoRef = useRef(null);
  useEffect(() => {
    if (!videoRef.current)
      return
    videoRef.current.defaultMuted = true
    videoRef.current.muted = true
  }, [])

  return (
    <React.Fragment>
      <Box sx={{
        'position': 'relative',
        'height': '100vh',
        'WebkitTouchCallout': 'none',
        'WebkitUserSelect': 'none',
        'KhtmlUserSelect': 'none',
        'MozUserSelect': 'none',
        'msUserSelect': 'none',
        'userSelect': 'none',
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
            <Video />
            <Box sx={{
              'position': "absolute",
              'top': '38%',
              'textAlign': 'center',
            }}>
              <Box sx={{
                'fontFamily': 'NanumGothic',
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