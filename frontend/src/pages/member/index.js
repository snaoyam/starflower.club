import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import React, {useEffect, useState} from "react"
import {Box} from '@mui/material'
import "./index.css"
import GatherComponent from "./gather"

function Member({setTopBarCss, newSession}) {

  useEffect(() => {
    newSession()
    setTopBarCss(0.8)
  }, [])

  return (
    <React.Fragment>
      <Box sx={{'height': '65px'}}></Box>
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