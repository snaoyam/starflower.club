import React, {useState} from "react"
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    type: 'dark',
    background: {
      paper: '#b39666',
    },
  }
})

const GatherElement = React.forwardRef(({style, value}, ref) => {
  return (
  <div style={style} ref={ref}>
    <ThemeProvider theme={theme}>
      <Paper sx={{'margin': '0 min(calc(0.3vw + 5px), 15px)', 'width': 260, 'height': 260, 'padding': '10px'}} elevation={5}>
        <Box sx={{'width': '100%', 'height': 44, 'display': 'flex', 'alignItems': 'center'}}>
          {value.title}
        </Box>
        <Box sx={{'width': '100%', 'height': 100, 'whiteSpace': 'pre-line', 'overflow': 'hidden'}}>
          {value.contents}
        </Box>
        <Box>
          
        </Box>
      </Paper>
    </ThemeProvider>
  </div>
  )
})

export default GatherElement