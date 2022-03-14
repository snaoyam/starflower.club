import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {Box} from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'

function NotFound() {
  window.scrollTo(0,0)
  location.href = "http://starflower.club/wordpress/past-works"
  return (
    <React.Fragment>
      <Box sx={{'height': '100vh'}}></Box>
      <Box sx={{
        'position': 'fixed',
        'top': '65px',
        'width': '100%',
        'height': 'calc(100vh - 65px)',
      }}>
        <Box sx={{
          'height': '100%',
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
            'paddingBottom': '100px',
            '& > span': {
              'color': 'white',
              'fontFamily': 'NanumSquare',
              'fontWeight': 500,
              'fontSize': 'min(6vw, 24px)',
            },
          }}>
            <AutoFixHighIcon sx={{
              'color': 'rgba(191, 191, 191, 0.8)',
              'fontSize': 'min(20vw, 100px)',
              'marginBottom': '15px',
            }}/>
            <Box sx={{
              'fontFamily': 'NanumGothic',
              'fontSize': 'min(9vw, 50px)',
              'color': 'rgba(191, 191, 191, 0.8)',
              'marginBottom': 'min(6vw, 27px)',
            }}>
              Under Construction
            </Box>
            <span>페이지를 준비중입니다.</span>
            <span>구 홈페이지로 리다이렉트 됩니다...</span>
          </Box>
        </Box>
      </Box>
      
    </React.Fragment>
  )
}

export default NotFound