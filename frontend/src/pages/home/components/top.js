import React, {useEffect, useRef} from "react"
import {Box} from '@mui/material'
import Video from './video'
import {ReactComponent as MainText} from './mainText.svg'

function Top({page}) {

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
              'top': navigator.userAgent.includes('iPhone') ? '37%' : '40%',
              'textAlign': 'center',
              '& svg': {
                'height': 'min(16vw, 85px)'
              }
            }}>
              <MainText />
            </Box>
        </Box>
      </Box>
    </React.Fragment>
  )
}

export default Top