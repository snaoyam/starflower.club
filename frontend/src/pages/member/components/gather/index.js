import React, {useState} from "react"
import {Box, Grow, Fab} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import GatherElement from './element'
import "./index.css"
import Popnewgather from './popnewgather'


function GatherComponent() {
  const [open, setOpen] = useState(false)
  return (
    <div id='gathercomponent'>
      <Box sx={{ display: 'flex' }}>
        <Grow in={true}>{<GatherElement />}</Grow>
        <Grow in={true} timeout={500}>{<GatherElement />}</Grow>
        <Grow in={true} timeout={1000}>{<GatherElement />}</Grow>
      </Box>
      <Popnewgather open={open} setOpen={setOpen} />
    </div>
  )
}

export default GatherComponent