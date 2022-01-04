import React, {useState} from "react"
import {Fab, Dialog, Zoom} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import Popelement from './popelement'

function Popnewgather() {
  const [open, setOpen] = useState(false)

  return (
    <React.Fragment>
      <Zoom in={true} timeout={500}>
        <Fab color="secondary" sx={{'position': 'absolute', 'right': 'calc(35% + 40px)', 'top': '310px'}} onClick={() => setOpen(!open)}>
          <AddIcon />
        </Fab>
      </Zoom>
      <Dialog onClose={() => setOpen(false)} open={open} 
        sx={{
          margin: '10px',
          "& .MuiDialog-container .MuiPaper-root": {
            width: '100%',
            maxWidth: '500px',
            height: '100%',
            maxHeight: '500px',
          }
        }}
      >
        <Popelement open={open} setOpen={setOpen} />
      </Dialog>
    </React.Fragment>
  )
}

export default Popnewgather
