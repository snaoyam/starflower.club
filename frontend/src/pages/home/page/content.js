import React, {useEffect, useState} from "react"
import Gradient from 'rgt'
import {Box} from '@mui/material'

function Content() {
  return (
    <React.Fragment>
      <Box className='blank' sx={{'height': '65px'}}></Box>
      <Box sx={{
        'width': 'calc(100% - min(6vw, 60px) - 20px)',
        'maxWidth': '1000px',
        'margin': '20px auto 0px auto',
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
        '-khtml-user-select': 'none',
        '-moz-user-select': 'none',
        '-ms-user-select': 'none',
        'user-select': 'none',
      }}>
        <Box sx={{
          'width': '100%',
          'height': '40px',
          '& span': {
            'fontFamily': 'NanumBarun',
            'fontSize': 'min(8vw, 30px)',
          }
        }}>
          <Gradient dir="left-to-right" from="#e67373" to="#ae84ff">
            최근 전시회
          </Gradient>
        </Box>
        <Box sx={{'height': '1000px', 'width': '100%'}}></Box>
      </Box>
    </React.Fragment>
  )
}

export default Content


