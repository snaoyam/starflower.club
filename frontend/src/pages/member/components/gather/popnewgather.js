import React, {useState} from "react"
import {Box, Paper, Backdrop} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import GatherElement from "./element"

const theme = createTheme({
  palette: {
    type: 'dark',
    background: {
      paper: '#b39666',
    },
  }
})

function Popnewgather({open, setOpen}) {
  return (
    <Backdrop open={open} onClick={() => { setOpen(false) }}>
      <GatherElement />
    </Backdrop>
  )
}

export default Popnewgather
