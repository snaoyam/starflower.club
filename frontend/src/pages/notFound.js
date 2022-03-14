import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {Box} from '@mui/material'
import {css} from '@emotion/css'
import Spaceout from '../spaceout'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

function NotFound() {
  window.scrollTo(0,0)
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
          <Spaceout />
          <Box sx={{
            'position': 'absolute',
            'textAlign': 'center',
            'display': 'grid',
            'justifyItems': 'center',
            '& span': {
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
              Not Found
            </Box>
            <span>페이지를 찾을 수 없습니다.</span>
            <span>돌아가서 다른 정보들을 찾아보세요!</span>
            <Link to="/">
              <Box sx={{
                'marginTop': '10px',
                'border': '2px solid white',
                'borderRadius': '5px',
                'display': 'flex',
                'alignItems': 'center',
                'justifyContent': 'center',
                'flexShrink': 0,
                'padding': '8px 2px 8px 10px',
                'color': 'white',
                '& span': {
                  'fontFamily': 'NanumSquare',
                  'letterSpacing': '1px',
                  'fontWeight': 1000,
                  'fontSize': 'min(8vw, 16px)',
                  'paddingTop': '2px',
                  'marginRight': '1px',
                },
              }}>
                <span>돌아가기</span>
                <ArrowForwardIosIcon sx={{
                  'height': 'min(4vw, 12px)',
                }}/>
              </Box>
            </Link>
          </Box>
        </Box>
      </Box>
      
    </React.Fragment>
  )
}

export default NotFound


