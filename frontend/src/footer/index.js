import React, {useEffect} from "react"
import { Link } from "react-router-dom"
import {Box} from '@mui/material'
import {css} from '@emotion/css'
import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import YouTubeIcon from '@mui/icons-material/YouTube'


const Footer = ({session, topBarCss}) => {
  
  return (
    <Box sx={{
      'position': 'relative',
      'height': '200px',
      'width': '100%',
      'backgroundColor': 'rgb(26, 26, 26)',
      'borderRadius': '25px 25px 0 0',
      'display': 'flex',
      'alignItems': 'center',
      'padding': '0px 0 10px 0',
      'color': 'white',
    }}>
      <Box sx={{
        'width': 'calc(100% - min(6vw, 60px))',
        'maxWidth': '886px',
        'margin': '0 auto',
        'padding': '15px 0',
        'display': 'flex',
        'flexWrap': 'wrap',
      }}>
        <Box sx={{
          'width': '100%',
          '& img': {
            'WebkitTouchCallout': 'none',
            'WebkitUserSelect': 'none',
            'KhtmlUserSelect': 'none',
            'MozUserSelect': 'none',
            'msUserSelect': 'none',
            'userSelect': 'none',
            'display': 'block',
            'width': '140px',
            'marginBottom': '6px',
          },
          '& span': {
            'marginLeft': '10px',
            'fontFamily': 'NanumBarun',
            'fontSize': 'min(2.4vw, 12px)',
            'display': 'block',
            'marginBottom': '4px',
          }
        }}>
          <img src='/footer/starflower_logo.png'></img>
          <span>KAIST 학부 동아리연합회 전시창작분과 소속</span>
          <span>대전 유성구 대학로 291 한국과학기술원 태울관 3101호</span>
          <Box sx={{
            'display': 'flex',
            'width': '100%',
          }}>
            <Box>
              <span>대표  문동우 / 부대표  이한샘</span>
              <span>starflower.kaist@gmail.com</span>
              <span>우리은행 1006-401-528528 (별바라기)</span>
            </Box>
            <Box sx={{
              'margin': 'auto 8px 0 auto', 
              'display': 'flex',
              '& > a': {
                'color': 'white',
                '& > svg': {
                  'margin': '5px',
                }
              }
            }}>
              <a href="https://instagram.com/kaist_starflower">
                <InstagramIcon />
              </a>
              <a href="http://www.facebook.com/starflowerkaist">
                <FacebookIcon />
              </a>
              <a href="https://www.youtube.com/channel/UCA_LR9LUj4xLiwzxHbNWXVg">
                <YouTubeIcon />
              </a>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
