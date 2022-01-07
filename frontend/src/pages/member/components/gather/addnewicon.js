import React, {useState} from "react"
import {Fab, Dialog, Zoom} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import Popelement from './popelement'

function Popnewgather() {
  const [open, setOpen] = useState(false)
  const [addInputs, setAddInputs] = useState({'title': '', 'contents': ''})

  return (
    <React.Fragment>
      <Zoom in={true} timeout={500}>
        <Fab color="secondary" sx={{'position': 'absolute', 'right': 'calc(35% + 40px)', 'top': '310px'}} onClick={() => setOpen(!open)}>
          <AddIcon />
        </Fab>
      </Zoom>
      <Dialog onClose={() => setOpen(false)} open={open} 
        sx={{
          'margin': '10px',
          "& .MuiDialog-container > .MuiPaper-root": {
            'margin': '5px',
          },
          "& .MuiDialog-container .MuiPaper-root": {
            'width': '100%',
            'maxWidth': '470px',
            'height': '100%',
            'maxHeight': '470px',
          }
        }}
      >
        <Popelement setOpen={setOpen} addInputs={addInputs} setAddInputs={setAddInputs} />
      </Dialog>
    </React.Fragment>
  )
}

export default Popnewgather
