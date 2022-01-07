import React, {useState, useRef} from "react"
import {Paper, Box, Chip, Button, InputBase, DialogTitle, DialogContent, DialogActions, ClickAwayListener, Zoom, List, MenuItem, Popover} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxOutlineIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { createTheme, ThemeProvider } from '@mui/material/styles'

const option = ['활동1', '활동2', '활동3', '활동4', '활동5', '활동6', '활동7', '활동8']

function Popnewgather({open, setOpen}) {
  const inputRef = useRef();
  const [inputs, setInputs] = useState({'title': '', 'contents': ''})
  const [selected, setSelected] = useState([])
  const [anchorEl, setAnchorEl] = React.useState(null)

  return (
    <Paper sx={{overflow: 'hidden'}}>
      <DialogTitle sx={{'textAlign': 'end', 'padding': 0, "& .MuiDialog-container .MuiPaper-root": {width: '100%'}}}>
        <IconButton
          onClick={() => setOpen(false)} sx={{'margin': '10px 10px 0 0', 'padding': '5px'}}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{'padding': '30px 35px 0 35px', 'height': 'calc(100% - 44px)'}}>
        <InputBase
          placeholder="제목"
          fullWidth
          required={true}
          variant="outlined"
          inputProps={{style: {'fontSize': 32, 'padding': '0 15px 0 0'}}}
          value={inputs.title}
          style={{marginBottom: 5}}
          onChange={(e) => setInputs({...inputs, 'title': e.target.value})}
        />
        <Box style={{marginBottom: 5}} id='tagbox'
        sx={{'overflowX': 'scroll', 'height': '32px', 'padding': '0 0 5px 0', 'display': 'flex', 'gap': 0.5, 
        'MsOverflowStyle': 'none', 'scrollbarWidth': 'none', '&::-webkit-scrollbar': {'display': 'none'}}}>
          {selected.map(index =>  (<Chip key={option[index]} label={option[index]} />))}
          <Chip
            label={<AddIcon />}
            onClick={() => setAnchorEl(document.getElementById("tagbox"))}
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
          <Popover open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            id='selectTagPopover'
            sx={{
              '& > .MuiPaper-elevation': {
                'width': 'calc(100% - 100px)',
                'maxWidth': '300px',
              }
            }}
            >
            <Paper elevation={3}
                style={{'maxHeight': '240px', 'maxWidth': '300px', 'width': '100%', 'overflowY': 'scroll', 'overflowX': 'hidden',}}
                sx={{'MsOverflowStyle': 'none', 'scrollbarWidth': 'none', '&::-webkit-scrollbar': {'display': 'none'}}}
                >
                <List>
                  {option.map((value, index) => (
                    <MenuItem value={value} key={index} onClick={() => { setSelected(selected.includes(index) ? selected.filter(val => val !== index) : [...selected, index]) }}>
                      {selected.includes(index) ? (<CheckBoxIcon sx={{'margin': '0 6px 0 0'}}/>) : (<CheckBoxOutlineIcon sx={{'margin': '0 6px 0 0'}}/>)}
                      {value}
                    </MenuItem>
                  ))}
                </List>
              </Paper>
          </Popover>
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