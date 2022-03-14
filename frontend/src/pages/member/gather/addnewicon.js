import React, {useState} from "react"
import {Fab, Dialog, Zoom} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import Popelement from './popelement'

function Popnewgather({refreshposts}) {
  const [open, setOpen] = useState(false)
  const [addInputs, setAddInputs] = useState({'title': '', 'contents': ''})

  return (
    <React.Fragment>
      <Zoom in={true} timeout={500}>
        <Fab color="secondary" sx={{'position': 'absolute', 'right': '10px', 'bottom': '10px'}} onClick={() => setOpen(!open)}>
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
        <Popelement setOpen={setOpen} addInputs={addInputs} setAddInputs={setAddInputs} refreshposts={refreshposts}/>
      </Dialog>
    </React.Fragment>
  )
}

export default Popnewgather
