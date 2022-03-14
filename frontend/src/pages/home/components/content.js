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

  const tilecss = css({
    'backgroundColor': '#262626',
    'height': '350px',
    'maxHeight': 'min(55vh, 60vw)',
    'position': 'relative',
    'overflow': 'hidden',
    'borderRadius': '5px',
    'width': 'calc(50% - min(30px, 1.4vw))',
    'margin': 'min(15px, 0.7vw)',
    '& > img': {
      'width': '100%',
      'height': '100%',
      'objectFit': 'cover',
      'transition': 'transform 0.7s ease',
      'position': 'absolute',
    },
    '& > a': {
      'fontFamily': 'NanumBarun',
      'width': '100%',
      'height': '100%',
      'position': 'absolute',
      'display': 'flex',
      'justifyContent': 'center',
      'alignItems': 'center',
      'zIndex': 10,
      'cursor': 'pointer',
      'textAlign': 'center',
      'color': 'white',
      '&:hover + img': {
        'transform': 'scale(1.3)',
        'transition': 'transform 2s',
      },
      '& > div': {
        'width': '80%',
        'maxWidth': '290px',
        'textShadow': '0 0 12px rgb(0 0 0)',
        '& > span': {
          'fontSize': 'min(6vw, 36px)',
        },
        '& > p': {
          'fontSize': 'min(2.4vw, 18px)',
        }
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
        'color': 'white',
      }}>
        <Box sx={{
          'width': '100%',
          'maxHeight': '70vh',
          'minHeight': '60vh',
          'height': '60vw',
          'overflow': 'hidden',
          'position': 'relative',
        }}>
          <Box sx={{
            'width': '100%',
            'height': '100%',
            '& img': {
              'width': '100%',
              'height': '100%',
              'objectFit': 'cover',
            },
          }}>
            <img src='home/content/nebula.jpg'></img>
          </Box>
          <Box sx={{
            'position': 'absolute',
            'top': '0',
            'right': '10vw',
            'marginLeft': '20vw',
            'height': '100%',
            'display': 'flex',
            'alignItems': 'center',
          }}>
            <Box>
              <Box className={hueCss} sx={{
                'fontFamily': 'sans-serif',
                'fontWeight': 900,
                'fontSize': 'min(12vw, 80px)',
                'textAlign': 'right',
              }}>
                We are Starflower
              </Box>
              <Box sx={{
                'fontFamily': 'NanumBarun',
                'fontSize': 'min(4vw, 20px)',
                'textAlign': 'right',
                'marginRight': '4px',
              }}>
                KAIST 천체관측 동아리 별바라기입니다
              </Box>
              <Link to="/about">
                <Box sx={{
                  'fontFamily': 'NanumBarun',
                  'fontSize': 'min(3vw, 15px)',
                  'textAlign': 'right',
                  'margin': '4px -4px 0 0',
                  'color': 'rgb(150, 150, 150)',
                  'alignItems': 'center',
                  'display': 'flex',
                  'justifyContent': 'flex-end',
                }}>
                  더 알아보기
                  <ArrowForwardIosIcon sx={{
                    'height': 'min(4vw, 12px)'
                  }}/>
                </Box>
              </Link>
            </Box>
          </Box>
        </Box>
        <Box sx={{
          'width': 'calc(100% - min(6vw, 60px) + 10px)',
          'maxWidth': '900px',
          'margin': '0 auto',
          'padding': '15px 0',
          'display': 'flex',
          'flexWrap': 'wrap',
        }}>
          {/*<Box sx={{
            'margin': '10px 0 10px calc(40px - min(40px, 3vw))',
            '& span': {
              'fontFamily': 'Raleway, sans-serif',
              'fontSize': 'min(12vw, 40px)',
              'fontWeight': 400,
              'color': 'white',
            },
          }}>
            <span>
              Exhibitions
            </span>
          </Box>*/}
          <Box sx={{
            'backgroundColor': '#262626',
            'height': '550px',
            'maxHeight': 'min(55vh, 60vw)',
            'position': 'relative',
            'overflow': 'hidden',
            'borderRadius': '5px',
            'width': 'calc(100% - min(30px, 1.4vw))',
            'margin': 'min(15px, 0.7vw)',
          }}>
            <Box sx={{
              'width': '100%',
              'height': '100%',
              'position': 'absolute',
              '&:before': {
                'content': '""',
                'width': '100%',
                'height': '100%',
                'position': 'absolute',
                'background': 'rgba(0,0,0,0.3)',
              },
              '& img': {
                'width': '100%',
                'height': '100%',
                'objectFit': 'cover',
              },
            }}>
              <img src='home/exhibition/253213594_2017028065123230_4876617960639262668_n.jpg'></img>
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
                  <Link to="/exhibition/2021kaistist">
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
          <Box className={tilecss}>
            <Link to="/astrophotography">
              <Box>
                <span>천문 사진</span>
                <p>별바라기에서 과거에 촬영한 <br/>천문 사진 작품을 모아두었습니다.</p>
              </Box>
            </Link>
            <img src='home/content/A1_01_Perseus-Double-Cluster.jpg'></img>
          </Box>
          <Box className={tilecss}>
            <Link to="/exhibition">
              <Box>
                <span>최근 전시회</span>
                <p>별바라기에서 과거에 촬영한<br/>천문 사진 작품을 모아두었습니다.</p>
              </Box>
            </Link>
            <img src='home/content/A1_10_Horsehead.jpg'></img>
          </Box>
          <Box className={tilecss}>
            <Link to="/news">
              <Box>
                <span>뉴스/이벤트</span>
                <p>별바라기의 활동 소식도 여기서!<br/>진행중인 이벤트도 확인해보세요!</p>
              </Box>
            </Link>
            <img src='home/content/A3_06_Northern-Sky-Trails.jpg'></img>
          </Box>
          <Box className={tilecss}>
            <Link to="/apply">
              <Box>
                <span>리크루팅</span>
                <p>별바라기의 회원이 되고 싶으신가요?</p>
              </Box>
            </Link>
            <img src='home/content/star-1.jpg'></img>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  )
}

export default Content


