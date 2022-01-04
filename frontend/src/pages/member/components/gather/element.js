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


const GatherElement = React.forwardRef((props, ref) => {
  return (
  <div {...props} ref={ref}>
    <ThemeProvider theme={theme}>
      <Paper sx={{ margin: '10px' }} elevation={5}>
        <Box sx={{ width: 280, height: 280 }}>
          
        </Box>
      </Paper>
    </ThemeProvider>
  </div>
  )
})

export default GatherElement