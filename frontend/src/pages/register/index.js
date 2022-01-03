import React, {useState, useEffect} from "react"
import axios from "axios"
import {Button, MenuItem, FormControl, FormHelperText, Checkbox, TextField, Box, CircularProgress} from '@mui/material'
import {DatePicker, LocalizationProvider} from '@mui/lab'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import "./index.css"
import {ThemeProvider} from '@mui/material/styles'

function Register({muiTheme}) {
  const [inputs, setInputs] = useState({'username': '', 'password': '', 'email': '', 'name': '', 'phone': '', 'studentid': '', 'memberFrom': 2021, 'graduated': false})
  const [focus, setFocus] = useState({'username': false, 'password': false, 'confirmpassword': false, 'email': false, 'name': false, 'phone': false, 'studentid': false})
  const [passworderror, setPasswordError] = useState(false)
  const [memberFrom, setmemberFrom] = useState([new Date(), 0])
  const [confirmpassword, setConfirm] = useState('')
  const [opendate, setOpenDate] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setPasswordError(focus.password && focus.confirmpassword && inputs.password !== '' && confirmpassword !== '' && inputs.password !== confirmpassword)
  }, [inputs.password, confirmpassword, focus.password, focus.confirmpassword]);

  const register = async () => {
    setFocus({'username': true, 'password': true, 'confirmpassword': true, 'email': true, 'name': true, 'phone': true, 'studentid': true})
    if(validateInput()) {
      try {
        setLoading(true)
        const { data } = await axios.post(`/api/register`, {...inputs, 'memberFrom': memberFrom[0].getFullYear()+memberFrom[1]})
        if(data.success) {
          window.location.href = "/member"
        }
        else {
          alert("Register failed")
        }
      } catch(err) {
        alert("Register failed")
      }
      setLoading(false)
    }
  }

  const validateInput = () => {
    return !(inputs.username === ''||inputs.password === ''||inputs.email === ''||inputs.name === ''||inputs.phone === ''||inputs.studentid === ''||confirmpassword === ''||inputs.password !== confirmpassword)
  }
  /*
  const inputformsx = {
    "& .MuiFilledInput-root .MuiFilledInput-input": {
      backgroundColor: "rgb(92, 92, 92)",
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "4px",
    },
  }*/

  return (
    <div id="registerpage">
      <div id='registermodulep'>
        <div id="registermodule">
          <div id="registertxt"><span>회원가입</span></div>
          <div id="registerinputform">
            <ThemeProvider theme={muiTheme.textfield}>
            <TextField
              error={focus.name && inputs.name === ''}
              helperText={focus.name && inputs.name === '' ? "이름을 입력해 주세요" : null}
              variant="filled"
              label="Name"
              value={inputs.name}
              onChange={(e) => setInputs({...inputs, 'name': e.target.value})}
              onBlur={() => setFocus({...focus, 'name': true})}
              style={{width: "100%", marginBottom: focus.name && inputs.name === '' ? 0 : 10}}
              autoComplete='off'
              size="small"
              //sx={inputformsx}
            />
            <TextField
              error={focus.studentid && inputs.studentid === ''}
              helperText={focus.studentid && inputs.studentid === '' ? "학번을 입력해 주세요" : null}
              variant="filled"
              label="KAIST Student ID"
              value={inputs.studentid}
              onChange={(e) => setInputs({...inputs, 'studentid': e.target.value})}
              onBlur={() => setFocus({...focus, 'studentid': true})}
              style={{width: "100%", marginBottom: focus.studentid && inputs.studentid === '' ? 15 : 30}}
              autoComplete='off'
              size="small"
              //sx={inputformsx}
            />
            <TextField
              error={focus.username && inputs.username === ''}
              helperText={focus.username && inputs.username === '' ? "아이디를 입력해 주세요" : null}
              variant="filled"
              label="Username"
              value={inputs.username}
              onChange={(e) => setInputs({...inputs, 'username': e.target.value})}
              onBlur={() => setFocus({...focus, 'username': true})}
              style={{width: "100%", marginBottom: focus.username && inputs.username === '' ? 0 : 10}}
              autoComplete='off'
              size="small"
              //sx={inputformsx}
            />
            <div className="doubleformpassword">
              <TextField
                error={(focus.password && inputs.password === '') || passworderror}
                helperText={((focus.password && inputs.password === '') || passworderror) ? (passworderror ? "비밀번호가 일치하지 않습니다" : "비밀번호를 입력해 주세요") : null}
                variant="filled"
                label="Password"
                type="password"
                value={inputs.password}
                onChange={(e) => setInputs({...inputs, 'password': e.target.value})}
                onBlur={() => setFocus({...focus, 'password': true})}
                style={{width: "50%", marginBottom: (focus.password && inputs.password === '') || passworderror ? 15 : 30}}
                autoComplete='off'
                size="small"
                //sx={inputformsx}
              />
              <TextField
                error={(focus.confirmpassword && confirmpassword === '') || passworderror}
                helperText={focus.confirmpassword && confirmpassword === '' ? "비밀번호를 다시 입력해 주세요" : null}
                variant="filled"
                label="Confirm"
                type="password"
                value={confirmpassword}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setFocus({...focus, 'confirmpassword': true})}
                style={{width: "50%", marginBottom: focus.confirmpassword && confirmpassword === '' ? 15 : 30, marginLeft: 10}}
                autoComplete='off'
                size="small"
                //sx={inputformsx}
              />
            </div>
            <TextField
              error={focus.email && inputs.email === ''}
              helperText={focus.email && inputs.email === '' ? "이메일을 입력해 주세요" : null}
              variant="filled"
              label="Email"
              value={inputs.email}
              onChange={(e) => setInputs({...inputs, 'email': e.target.value})}
              onBlur={() => setFocus({...focus, 'email': true})}
              style={{width: "100%", marginBottom: focus.email && inputs.email === '' ? 0 : 10}}
              autoComplete='off'
              size="small"
              //sx={inputformsx}
            />
            <TextField
              error={focus.phone && inputs.phone === ''}
              helperText={focus.phone && inputs.phone === '' ? "핸드폰 번호를 입력해 주세요" : null}
              variant="filled"
              label="Phone Number"
              value={inputs.phone}
              onChange={(e) => setInputs({...inputs, 'phone': e.target.value})}
              onBlur={() => setFocus({...focus, 'phone': true})}
              style={{width: "100%", marginBottom: focus.phone && inputs.phone === '' ? 0 : 10}}
              autoComplete='off'
              size="small"
              //sx={inputformsx}
            />
            <div className="doubleformstartfrom">
              <FormControl variant="standard" sx={{ width: 100 }} style={{ marginBottom: 15 }}>
                <FormHelperText style={{ marginLeft: 5 }}>활동 시작 시기</FormHelperText>
                <LocalizationProvider sx={{ width: 30 }} dateAdapter={AdapterDateFns}>
                  <ThemeProvider theme={muiTheme.select}>
                    <DatePicker
                      inputFormat="yyyy"
                      views={['year']}
                      label="Year"
                      minDate={new Date('1978-03-01')}
                      maxDate={new Date()}
                      value={memberFrom[0]}
                      open={opendate}
                      onOpen={() => setOpenDate(true)}
                      onClose={() => setOpenDate(false)}
                      OpenPickerButtonProps={{ disabled: true, style: { display: 'none' }}}
                      onChange={(e) => { setmemberFrom([e, memberFrom[1]]) }}
                      renderInput={(params) => <ThemeProvider theme={muiTheme.textfield}><TextField {...params} variant="filled" size="small" helperText={null} onClick={(e) => setOpenDate(true)} /></ThemeProvider>}
                    />
                  </ThemeProvider>
                </LocalizationProvider>
              </FormControl>
              <TextField
                select
                variant="filled"
                label="Season"
                size="small"
                value={memberFrom[1]}
                onChange={(e) => { setmemberFrom([memberFrom[0], e.target.value]) }}
                style={{ marginBottom: 15, marginLeft: 10}}
                sx={{ width: 80 }}
                >
                <MenuItem value={0}>봄</MenuItem>
                <MenuItem value={0.5}>가을</MenuItem>
              </TextField>
              <FormControl style={{ marginBottom: 15, marginLeft: 0 }}>
                <FormHelperText>졸업생 여부</FormHelperText>
                <Box style={{ marginLeft: 15 }}>
                  <Checkbox
                    onChange={(e) => setInputs({...inputs, 'graduated': e.target.checked})}
                    checked={inputs.graduated}
                    sx={{
                      '& .MuiSvgIcon-root': { fontSize: 28 },
                      color: '#fff',
                      '&.Mui-checked': {
                        color: '#fff',
                      },
                    }}
                    size="small"
                  />
                </Box>
              </FormControl>
            </div>
            </ThemeProvider>
          </div>
          <Button
            variant="contained"
            color="primary"
            style={{width: '120px', height: 36, boxShadow: 'none', backgroundColor: 'orange', marginLeft: 'auto', marginBottom: 50}}
            onClick={() => register()}
            >{loading ? (
              <CircularProgress
                variant="indeterminate"
                disableShrink
                sx={{ color: 'white', animationDuration: '700ms' }}
                size={24}
              />
            ) : '회원가입!'}</Button>
        </div>
      </div>
    </div>
  )
}

export default Register