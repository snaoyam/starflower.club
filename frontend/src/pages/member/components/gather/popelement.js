import React, {useState, useRef} from "react"
import {Paper, Box, Chip, Button, InputBase, DialogTitle, DialogContent, DialogActions, ClickAwayListener, Zoom, List, MenuItem} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { createTheme, ThemeProvider } from '@mui/material/styles'

function Popnewgather({open, setOpen}) {
  const inputRef = useRef();
  const [inputs, setInputs] = useState({'title': '', 'contents': ''})
  const [option, setOption] = useState(['활동1 ', '활동2', '활동3'])
  const [selected, setSelected] = useState(['활동1 ', '활동2', '활동3'])
  const [showpicker, setShowpicker] = useState(false)

  return (
    <Paper sx={{overflow: 'hidden'}}>
      <DialogTitle sx={{'textAlign': 'end', 'padding': 0, "& .MuiDialog-container .MuiPaper-root": {width: '100%'}}}>
        <IconButton
          onClick={() => setOpen(false)} sx={{'margin': '10px 10px 0 0', 'padding': '5px'}}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{'padding': '30px 50px 0 35px', 'height': 'calc(100% - 44px)'}}>
        <InputBase
          placeholder="제목"
          fullWidth
          required={true}
          variant="outlined"
          inputProps={{style: {'fontSize': 32, 'padding': 0}}}
          value={inputs.title}
          style={{marginBottom: 5}}
          onChange={(e) => setInputs({...inputs, 'title': e.target.value})}
        />
        <Box style={{marginBottom: 5}} sx={{'overflowX': 'scroll', 'height': '32px', 'padding': '0 0 5px 0', 'display': 'flex', 'gap': 0.5}}>
          {selected.map((value) => (
            <Chip key={value} label={value} onDelete={() => {}} />
          ))}
          <Chip
            label={<AddIcon />}
            onClick={() => {
              setTimeout(() => {
                setShowpicker(true)
              }, 100)}
            }
            sx={{
              'cursor': 'pointer',
              '& .MuiChip-label': {
                'padding': '0',
                'display': 'flex',
                'justifyContent': 'center',
                'alignItems': 'center',
              },
              '& .MuiSvgIcon-root': {
                'margin': '0 8px 0 8px'
              }
            }}
          />
          <ClickAwayListener onClickAway={() => setShowpicker(false)}>
            <Zoom in={showpicker}>
              <Paper elevation={3} hidden={!showpicker}
                style={{'maxHeight': '240px', 'width': '300px', 
                  'position': 'absolute',
                  'top': '132px',
                  'left': '40px',
                  'zIndex': '10',
                }}
              >
                <List>
                  {option.map((value) => (
                    <MenuItem value={value}>{value}</MenuItem>
                  ))}
                </List>
              </Paper>
            </Zoom>
          </ClickAwayListener>
        </Box>
        <Box sx={{overflowY: 'scroll', height: 'calc(100% - 65px)', cursor: 'text'}} onClick={() => {inputRef.current.focus()}}>
          <InputBase
            placeholder="관측 계획"
            multiline={true}
            fullWidth
            variant="outlined"
            inputProps={{style: {fontSize: 24}}}
            inputRef={inputRef}
            value={inputs.contents}
            onChange={(e) => setInputs({...inputs, 'contents': e.target.value})}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{'padding': '5px', 'position': 'absolute', 'bottom': 0, 'right': 0}}>
        <Button onClick={() => {}}>업로드</Button>
      </DialogActions>
    </Paper>
  )
}

export default Popnewgather