import React, {useEffect, useState} from "react"
import Gradient from 'rgt'
import {Box} from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

function Content() {
  return (
    <React.Fragment>
      <Box className='blank' sx={{'height': '65px'}}></Box>
      <Box sx={{
        'width': 'calc(100% - min(6vw, 60px) + 10px)',
        'maxWidth': '1000px',
        'margin': '20px auto 0px auto',
        'WebkitTouchCallout': 'none',
        'WebkitUserSelect': 'none',
        'KhtmlUserSelect': 'none',
        'MozUserSelect': 'none',
        'msUserSelect': 'none',
        'userSelect': 'none',
      }}>
        <Box sx={{
          'width': '100%',
        }}>
          <Box sx={{
            'width': '100%',
            'height': '40px',
            '& span': {
              'fontFamily': 'NanumBarun',
              'fontSize': 'min(8vw, 30px)',
            },
            'marginBottom': '4px',
          }}>
            <Gradient dir="left-to-right" from="#e67373" to="#ae84ff">
              최근 전시회
            </Gradient>
          </Box>
          <Box sx={{
            'backgroundColor': '#262626',
            'width': '100%',
            'height': '550px',
            'position': 'relative',
          }}>
            <Box sx={{
              'width': '100%',
              'height': '100%',
              'position': 'absolute',
              'borderRadius': '5px',
              'overflow': 'hidden',
              '&:before': {
                'content': '""',
                'width': '100%',
                'height': '100%',
                'position': 'absolute',
                'background': 'rgba(0,0,0,0.2)',
              },
              '& img': {
                'width': '100%',
                'height': '100%',
                'objectFit': 'cover',
              }
            }}>
              <img src='home/exhibition/253213594_2017028065123230_4876617960639262668_n.jpg'></img>
              <Box sx={{
                'position': "absolute",
                'width': 'calc(100% - 80px)',
                'bottom': '0',
                'margin': '0 40px 40px 40px',
              }}>
                <Box sx={{
                  'fontFamily': 'NanumBarun',
                  'letterSpacing': 'min(1.5vw, 5px)',
                  'color': 'white',
                  'fontSize': 'min(8vw, 40px)',
                  'marginBottom': '10px',
                }}>
                  공백
                </Box>
                <Box sx={{
                  'display': 'block',
                  'display': 'flex',
                  'justifyContent': 'space-between',
                  'alignItems': 'flex-start',
                }}>
                  <Box sx={{
                      'fontFamily': 'NanumBarun',
                      'letterSpacing': 'min(1.5vw, 5px)',
                      'color': 'white',
                      'fontSize': 'min(3vw, 16px)',
                      'display': 'block',
                      'wordBreak': 'keep-all',
                    }}>
                    전시창작분과 기획전시전 #3
                    <br/>
                    2021년 11월 8일 ~
                  </Box>
                  <Box sx={{
                    'marginTop': 'auto',
                    'padding': '8px 0 8px 8px',
                    'cursor': 'pointer',
                    'display': 'flex',
                    'color': 'white',
                    'border': '2px solid white',
                    'borderRadius': '5px',
                    'alignItems': 'center',
                    'justifyContent': 'center',
                    '& span': {
                      'fontFamily': 'NanumSquare',
                      'letterSpacing': '1px',
                      'fontWeight': 1000,
                      'fontSize': 'min(4vw, 16px)',
                      'paddingTop': '2px',
                      'marginRight': '1px',
                    },
                  }}>
                    <span>전시회로 이동</span>
                    <ArrowForwardIosIcon sx={{
                      'height': 'min(3vw, 16px)',
                    }}/>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  )
}

export default Content


