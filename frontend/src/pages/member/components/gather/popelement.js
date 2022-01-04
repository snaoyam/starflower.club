import React, {useState, useRef} from "react"
import {Paper, Box, Chip, Button, InputBase, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { createTheme, ThemeProvider } from '@mui/material/styles'

function Popnewgather({open, setOpen}) {
  const selected = ['안시관측', '사진촬영', '사진세미나']
  const [inputs, setInputs] = useState({'title': '', 'contents': ''})
  const inputRef = useRef();
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
        <Box style={{marginBottom: 10}} sx={{'overflowX': 'scroll', 'height': '32px', 'padding': '0', 'display': 'flex', 'gap': 0.5}}>
          {selected.map((value) => (
            <Chip key={value} label={value} />
          ))}
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