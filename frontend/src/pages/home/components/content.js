import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {Box} from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import {css} from '@emotion/css'

function Content() {
  const hueCss = css({
    'background': 'linear-gradient(to right, #FFF 2%, #FF0 30%, #FF0 50%, #FFF 80%)',
    'backgroundSize': '200% auto',
    'backgroundClip': 'text',
    'textFillColor': 'transparent',
    'WebkitBackgroundClip': 'text',
    'WebkitTextFillColor': 'transparent',
    'WebkitBackgroundClip': 'text',
    'WebkitTextFillColor': 'transparent',
    'WebkitAnimation': 'shine 10s infinite linear',
    '@keyframes shine' : {
      '0%': {
        'WebkitFilter': 'hue-rotate(0deg)',
      },
      '50%': {
        'WebkitFilter': 'hue-rotate(-100deg)',
      },
      '100%': {
        'WebkitFilter': 'hue-rotate(0deg)',
      },
    },
  })

  return (
    <React.Fragment>
      <Box sx={{
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
            'backgroundColor': '#262626',
            'width': '100%',
            'height': '550px',
            'maxHeight': 'min(55vh, 60vw)',
            'position': 'relative',
          }}>
            <Box sx={{
              'width': '100%',
              'height': '100%',
              'position': 'absolute',
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
              {/*<Box sx={{
                'position': 'absolute',
                'top': '10%',
                'left': '5%',
                'height': '40px',
                '& span': {
                  'fontFamily': 'NanumBarun',
                  'fontSize': 'min(8vw, 30px)',
                  'backgroundImage': 'linear-gradient(170deg, rgb(255,234,125), rgb(231,127,53))',
                  'WebkitTextFillColor': 'transparent',
                  'textFillColor': 'transparent',
                  'WebkitBackgroundClip': 'text',
                  'backgroundClip': 'text',
                },
                'marginBottom': '4px',
              }}>
                <span>
                  최근 전시회
                </span>
              </Box>*/}
              <Box sx={{
                'position': "absolute",
                'width': 'calc(100% - min(80px, 10vw))',
                'bottom': '0',
                'margin': 'min(40px, 5vw)',
              }}>
                <Box sx={{
                  'fontFamily': 'NanumBarun',
                  'letterSpacing': 'min(1.5vw, 5px)',
                  'color': 'white',
                  'fontSize': 'min(12vw, 40px)',
                }}>
                  공백
                </Box>
                <Box sx={{
                  'display': 'flex',
                  'justifyContent': 'space-between',
                  'alignItems': 'flex-start',
                  'flexFlow': 'row wrap',
                }}>
                  <Box sx={{
                      'fontFamily': 'NanumBarun',
                      'letterSpacing': 'min(1.5vw, 5px)',
                      'color': 'white',
                      'fontSize': 'min(3vw, 16px)',
                      'display': 'flex',
                      'wordBreak': 'keep-all',
                      'flexShrink': 0,
                      'marginTop': '10px',
                    }}>
                    전시창작분과 기획전시전 #3
                    <br/>
                    2021년 11월 8일 ~
                  </Box>
                  <Link to="/exhibition/11">
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
                      'flexShrink': 0,
                      'marginTop': '10px',
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
                        'height': 'min(4vw, 12px)',
                      }}/>
                    </Box>
                  </Link>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{
          'width': 'calc(100% - min(6vw, 60px) + 10px)',
          'maxWidth': '1000px',
          'margin': '50px auto 0px auto',
        }}>
          <Box sx={{
            'margin': '0 0 4px 0',
            '& span': {
              'fontFamily': 'NanumBarun',
              'fontSize': 'min(16vw, 60px)',
            },
          }}>
            <span className={hueCss}>
              We Are Starflower
            </span>
          </Box>
          <Box sx={{
            'fontFamily': 'NanumBarun',
            'color': 'white',
            'marginBottom': '12px',
          }}>
            별바라기는 1978년부터 활동을 시작한 KAIST 천체관측 동아리입니다. 천문학과가 따로 존재하지 않는 KAIST에서 별바라기는 천문학 또는 천체 관측에 관심이 있는 사람들의 모임의 장이었습니다. 별바라기 사람들은 언제나 맑은 날이면 천체 관측을 하고, 더 좋은 하늘을 찾아 학교 밖으로 관측회를 떠나곤 합니다.
          </Box>


          <Box sx={{
            '&:before': {
              'width': '100%',
              'paddingBottom': '62%',
              'content': '""',
              'display': 'block'
            },
            'width': '100%',
            'display': 'flex',
            'position': 'relative',
          }}>
            <Box sx={{
              'position': 'absolute',
              'left': 0,
              'top': 0,
              'width': '100%',
              'height': '100%',
              'display': 'flex',
              'flexWrap': 'wrap',
              'justifyContent': 'space-between',
              'alignContent': 'space-between',
              '& > div': {
                'width': '32%',
                'height': '48.4%',
                'borderRadius': '5px',
                'backgroundColor': 'rgb(30, 30, 30)',
              }
            }}>
              <Box></Box>
              <Box></Box>
              <Box></Box>
              <Box></Box>
              <Box></Box>
              <Box></Box>
            </Box>
          </Box>



        </Box>
        



        
      </Box>
    </React.Fragment>
  )
}

export default Content


