import React, {useState, useRef} from "react"
import {Paper, Box, Chip, Button, ButtonBase, ButtonGroup, InputBase, DialogTitle, DialogContent, DialogActions, List, MenuItem, ListItem, ListItemText, Divider, Popover, Grid} from '@mui/material'
import {LocalizationProvider, CalendarPicker} from '@mui/lab'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import CheckBoxOutlineIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

function Popnewgather({setOpen, addInputs, setAddInputs}) {
  const inputRef = useRef()
  const [option, setOption] = useState(['활동1', '활동2', '활동3', '활동4', '활동5', '활동6', '활동7', '활동8'])
  const [selectedTag, setSelectedTag] = useState([])
  const [tagPopoverAnchor, setTagAnchor] = useState(null)
  const [datePopoverAnchor, setDateAnchor] = useState(null)
  const [timePopoverAnchor, setTimeAnchor] = useState(null)
  const [customTag, setCustomTag] = useState('')
  const [hideDatePicker, setHideDate] = useState(true)
  const [date, setDate] = useState()
  const [time, setTime] = useState([null, null, 'PM'])
  const [timeSelect, setTimeSelect] = useState([false, false])

  const handleTimeChange = (event) => {
    setTime((event.target.value))
  }

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
        <Box sx={{overflowY: 'scroll', height: 'calc(100% - 165px)', cursor: 'text'}} onClick={() => {inputRef.current.focus()}}>
          <InputBase
            placeholder="활동 계획"
            multiline={true}
            fullWidth
            variant="outlined"
            inputProps={{style: {fontSize: 24}}}
            inputRef={inputRef}
            value={addInputs.contents}
            onChange={(e) => setAddInputs({...addInputs, 'contents': e.target.value})}
          />
        </Box>
        <Box style={{'marginBottom': '8px'}} sx={{'display': 'flex'}}>
          <Box style={{'marginRight': '10px'}} sx={{'paddingBottom': '2px'}} id='datebox'>
            <ButtonBase sx={{'backgroundColor': 'rgba(0, 0, 0, 0.08)', 'borderRadius': '6px', 'padding': '6px 9px 6px 8px', 'color': 'rgba(0, 0, 0, 0.33)', 'width': '106px', 'display': 'flex'}}
            onClick={() => {
                setHideDate(true)
                setDateAnchor(document.getElementById("datebox"))
              }}>
              <CalendarTodayIcon color="disabled" fontSize='small' sx={{'marginRight': '4px'}}/>
              <Box sx={{width: '76px', 'marginTop': '1px', 'fontSize': '14px'}}>
                {date ? ((date.getDate() === (new Date).getDate() && date - new Date() < 86400000) ? '오늘' : ((date.getDate() === ((new Date).getDate()+1) && date - new Date() < 172800000) ? '내일' : date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate())) : 'Add Date'}
              </Box>
            </ButtonBase>
          </Box>
          <Popover open={Boolean(datePopoverAnchor)}
            anchorEl={datePopoverAnchor}
            onClose={() => setDateAnchor(null)}
            anchorOrigin={hideDatePicker ? {
              vertical: 'bottom',
              horizontal: 'center',
            } : {
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={hideDatePicker ? {
              vertical: 'top',
              horizontal: 'center',
            } : {
              vertical: 'top',
              horizontal: 'left',
            }}
            sx={hideDatePicker ? {
              '& > .MuiPaper-elevation': {
                'width': '100px',
                'maxHeight': '240px',
              }
            } : {}}
            >
            <Box style={{'width': '100%', 'overflowY': 'scroll', 'overflowX': 'hidden'}}>
              {hideDatePicker ? (
                <List style={{'padding': '4px 0'}}>
                  <ListItem button style={{'padding': '0 16px'}} 
                  onClick={() => {
                    setDate(new Date())
                    setDateAnchor(null)
                  }}>
                    <ListItemText primary="오늘" />
                  </ListItem>
                  <ListItem button style={{'padding': '0 16px'}}
                  onClick={() => {
                    setDate(new Date(Date.now() + (3600 * 1000 * 24)))
                    setDateAnchor(null)
                  }}>
                    <ListItemText primary="내일" />
                  </ListItem>
                  <Divider light />
                  <ListItem button style={{'padding': '2px 16px 0px 16px'}} onClick={() => setHideDate(false)}>
                    <ListItemText primary="날짜 선택" />
                  </ListItem>
                </List>
              ) : (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <CalendarPicker date={date} 
                  onChange={(newDate) => {
                    setDate(newDate)
                    setDateAnchor(null)
                  }} 
                  minDate={new Date()} maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}/>
                </LocalizationProvider>
              )}
            </Box>
          </Popover>
          <Box sx={{'paddingBottom': '2px'}} id='timebox'>
            <ButtonBase sx={{'backgroundColor': 'rgba(0, 0, 0, 0.08)', 'borderRadius': '6px', 'padding': '6px 9px 6px 8px', 'color': 'rgba(0, 0, 0, 0.33)', 'width': '106px', 'display': 'flex'}}
            onClick={() => {
              setTimeSelect([false, false])
              setTimeAnchor(document.getElementById("timebox"))
            }}>
              <AccessTimeIcon color="disabled" fontSize='small' sx={{'marginRight': '4px'}}/>
              <Box sx={{width: '76px', 'marginTop': '1px', 'fontSize': '14px'}}>
                {time[1] ? (time[0]+':'+('0' + time[1].toString()).slice(-2)+' '+time[2]) : 'Add Time'}
              </Box>
            </ButtonBase>
          </Box>
          <Popover open={Boolean(timePopoverAnchor)}
            anchorEl={timePopoverAnchor}
            onClose={() => setTimeAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            sx={{
              '& > .MuiPaper-elevation': {
                'width': '150px',
                'maxHeight': '240px',
              }
            }}
            >
            <Box style={{'width': '100%', 'overflowY': 'scroll', 'overflowX': 'hidden'}}>
              {!timeSelect[0] ? (
                <List sx={{ 'flexGrow': 1, 'width': '100%', 'padding': 0}} subheader={
                  <Box sx={{'padding': '8px 0 0 10%', 'fontSize': '16px', 'color': 'gray', 'cursor': 'default'}}>
                    Hour
                  </Box>
                }>
                  <Grid container spacing={0}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(val => (<Grid item key={'hourselc'+val} xs={4}><MenuItem onClick={() => {
                      setTime([val, time[1], time[2]])
                      setTimeSelect([true, false])
                    }} sx={{'justifyContent': 'center'}}>{val}</MenuItem></Grid>))}
                  </Grid>
                </List>
              ) : (
                !timeSelect[1] ? (
                  <List sx={{ 'flexGrow': 1, 'width': '100%', 'padding': 0}} subheader={
                    <Box sx={{'padding': '8px 0 0 10%', 'fontSize': '16px', 'color': 'gray', 'cursor': 'default'}}>
                      Minute
                    </Box>
                  }>
                    <Grid container spacing={0}>
                      {[0,5,10,15,20,25,30,35,40,45,50,55].map(val => (<Grid item key={'minselc'+val} xs={4}><MenuItem onClick={() => {
                        setTime([time[0], val, time[2]])
                        setTimeSelect([true, true])
                      }} sx={{'justifyContent': 'center'}}>{('0' + val).slice(-2)}</MenuItem></Grid>))}
                    </Grid>
                  </List>
                ) : (
                  <ButtonGroup disableElevation variant="contained" sx={{'width': '100%', 'height': '32px', 'backgroundColor': 'rgba(0, 0, 0, 0.05)'}}>
                    <ButtonBase sx={{'width': 'calc(50% - 4px)', 'height': 'calc(100% - 4px)', 'borderRadius': '2px', 'margin': '2px', 'fontSize': '12px'}} disableRipple={true} 
                    style={time[2] === 'AM' ? {'backgroundColor': 'rgba(0, 0, 0, 0.15)'} : {}}
                    onClick={() => {
                      setTime([time[0], time[1], 'AM'])
                      setTimeAnchor(null)
                    }}>AM</ButtonBase>
                    <ButtonBase sx={{'width': 'calc(50% - 4px)', 'height': 'calc(100% - 4px)', 'borderRadius': '2px', 'margin': '2px', 'fontSize': '12px'}} disableRipple={true} 
                    style={time[2] === 'PM' ? {'backgroundColor': 'rgba(0, 0, 0, 0.15)'} : {}}
                    onClick={() => {
                      setTime([time[0], time[1], 'PM'])
                      setTimeAnchor(null)
                    }}>PM</ButtonBase>
                  </ButtonGroup>
                )
              )}
            </Box>
          </Popover>
        </Box>
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
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            sx={{
              '& > .MuiPaper-elevation': {
                'width': 'calc(100% - 100px)',
                'maxWidth': '200px',
                'maxHeight': '240px',
              }
            }}
            >
            <Box style={{'width': '100%', 'overflowY': 'scroll', 'overflowX': 'hidden',}}>
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
      </DialogContent>
      <DialogActions sx={{'padding': '5px', 'position': 'absolute', 'bottom': 0, 'right': 0}}>
        <Button onClick={() => {}}>업로드</Button>
      </DialogActions>
    </Paper>
  )
}

export default Popnewgather