import { BrowserRouter, Routes, Route } from "react-router-dom"
import React, {useEffect, useState} from "react"
import {Box} from '@mui/material'
import "./index.css"
import GatherComponent from "./gather"

function Member() {
  return (
    <React.Fragment>
      <Box className='blank' sx={{'height': '65px'}}></Box>
      <div id='memberpage'>
        <div id='gathercomponentp'>
          <GatherComponent />
        </div>
        <div id='component1'>
          
        </div>
      </div>
    </React.Fragment>
  )
}

export default Member