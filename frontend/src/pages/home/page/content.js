import { BrowserRouter, Routes, Route } from "react-router-dom"
import React, {useEffect, useState} from "react"
import Gradient from 'rgt'
import {Box} from '@mui/material'

function Content() {
  return (
    <React.Fragment>
      <Box sx={{
        'width': '96%',
        'maxWidth': '1000px',
        'margin': '20px auto 0px auto',
      }}>
        <Box sx={{
          'width': '100%',
          'height': '40px',
          '& span': {
            'fontFamily': 'NanumBarun',
            'fontSize': '30px',
          }
        }}>
          <Gradient dir="left-to-right" from="#e67373" to="#ae84ff">
            최근 전시회
          </Gradient>
        </Box>
      </Box>
      
      <Box sx={{'height': '1000px', 'width': '100%'}}>

      </Box>
    </React.Fragment>
  )
}

export default Content


