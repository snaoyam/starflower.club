import React, {useEffect, useRef} from "react"
import {Box} from '@mui/material'
import {css} from '@emotion/css'

function Exhibition() {
  location.href = "https://2021kartist.creatorlink.net"
  return (
    <React.Fragment>
      <Box sx={{'height': '65px'}}></Box>
      <Box sx={{
        'height': 'calc(80vh - 65px)',
        'width': '100%',
        'display': 'flex',
        'justifyContent': 'center',
        'alignItems': 'center',
        'position': 'relative',
        'WebkitTouchCallout': 'none',
        'WebkitUserSelect': 'none',
        'KhtmlUserSelect': 'none',
        'MozUserSelect': 'none',
        'msUserSelect': 'none',
        'userSelect': 'none',
      }}>
        <Box sx={{
          'position': 'absolute',
          'textAlign': 'center',
          'display': 'grid',
          'justifyItems': 'center',
          '& > span': {
            'color': 'white',
            'fontFamily': 'NanumSquare',
            'fontWeight': 500,
            'fontSize': 'min(6vw, 24px)',
          },
        }}>
          <Box sx={{
            'fontFamily': 'NanumGothic',
            'fontSize': 'min(18vw, 100px)',
            'color': 'rgba(191, 191, 191, 0.8)',
            'marginBottom': 'min(9vw, 40px)',
          }}>
            Redirectng..
          </Box>
          <span>외부 링크로 이동될 예정입니다.</span>
          <span>만약 이동이 되지 않는다면 아래 링크를 눌러주세요.</span>
          <a href="https://2021kartist.creatorlink.net" 
          className={css({
            'color': 'rgb(120, 120, 120)',
            'marginTop': '8px',
          })}>https://2021kartist.creatorlink.net</a>
        </Box>
      </Box>
    </React.Fragment>
  )
}

export default Exhibition