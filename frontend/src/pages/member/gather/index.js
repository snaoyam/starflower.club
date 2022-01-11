import React, {useState} from "react"
import {Box, Grow} from '@mui/material'
import GatherElement from './element'
import "./index.css"
import Addnewicon from './addnewicon'


function GatherComponent() {
  return (
    <div id='gathercomponent'>
      <Box sx={{ display: 'flex' }}>
        <Grow in={true}>{<GatherElement />}</Grow>
        <Grow in={true} timeout={500}>{<GatherElement />}</Grow>
        <Grow in={true} timeout={1000}>{<GatherElement />}</Grow>
      </Box>
      <Addnewicon />
    </div>
  )
}

export default GatherComponent