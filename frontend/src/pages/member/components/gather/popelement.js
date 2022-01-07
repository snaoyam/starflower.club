import React, {useState, useRef} from "react"
import {Paper, Box, Chip, Button, InputBase, DialogTitle, DialogContent, DialogActions, ClickAwayListener, Zoom, List, MenuItem, Popover} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckBoxOutlineIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { createTheme, ThemeProvider } from '@mui/material/styles'

function Popnewgather({setOpen, addInputs, setAddInputs}) {
  const inputRef = useRef()
  const [option, setOption] = useState(['활동1', '활동2', '활동3', '활동4', '활동5', '활동6', '활동7', '활동8'])
  const [selectedTag, setSelectedTag] = useState([])
  const [tagPopoverAnchor, setTagAnchor] = React.useState(null)
  const [customTag, setCustomTag] = useState('')

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
          value={addInputs.title}
          style={{marginBottom: 5}}
          onChange={(e) => setAddInputs({...addInputs, 'title': e.target.value})}
        />
        <Box style={{marginBottom: 5}} id='tagbox'
        sx={{'overflowX': 'scroll', 'height': '32px', 'padding': '0 0 5px 0', 'display': 'flex', 'gap': 0.5, 
        'MsOverflowStyle': 'none', 'scrollbarWidth': 'none', '&::-webkit-scrollbar': {'display': 'none'}}}>
          {selectedTag.map(index =>  (<Chip key={option[index]} label={option[index]} />))}
          <Chip
            label={<AddIcon />}
            onClick={() => setTagAnchor(document.getElementById("tagbox"))}
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
          <Popover open={Boolean(tagPopoverAnchor)}
            anchorEl={tagPopoverAnchor}
            onClose={() => setTagAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            id='selectTagPopover'
            sx={{
              '& > .MuiPaper-elevation': {
                'width': 'calc(100% - 100px)',
                'maxWidth': '200px',
                'maxHeight': '240px'
              }
            }}
            >
            <Box
              style={{'width': '100%', 'overflowY': 'scroll', 'overflowX': 'hidden',}}
              sx={{'MsOverflowStyle': 'none', 'scrollbarWidth': 'none', '&::-webkit-scrollbar': {'display': 'none'}}}
              >
              <List>
                {option.map((value, index) => (
                  <MenuItem value={value} key={index} onClick={() => { setSelectedTag(selectedTag.includes(index) ? selectedTag.filter(val => val !== index) : [...selectedTag, index]) }}>
                    {selectedTag.includes(index) ? (<CheckBoxIcon sx={{'margin': '0 6px 0 0'}}/>) : (<CheckBoxOutlineIcon sx={{'margin': '0 6px 0 0'}}/>)}
                    {value}
                  </MenuItem>
                ))}
                <Box sx={{'padding': '2px 16px 4px 20px', 'width': 'calc(100% - 36px)', 'display': 'flex'}}>
                  <InputBase placeholder="+ Add Tag" sx={{'padding': 0, 'width': 'calc(100% - 32px)'}} value={customTag} onChange={(e) => setCustomTag(e.target.value)}></InputBase>
                  <Box sx={{'width':'24px', 'display': 'flex', 'alignItems': 'center', 'cursor': 'pointer', 'padding': '4px'}} 
                  onClick={() => {
                    setOption([...option, customTag])
                    setCustomTag('')
                  }}>
                    {customTag ? (<AddCircleOutlineIcon color="action"/>) : null}
                  </Box>
                </Box>
              </List>
            </Box>
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
            value={addInputs.contents}
            onChange={(e) => setAddInputs({...addInputs, 'contents': e.target.value})}
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