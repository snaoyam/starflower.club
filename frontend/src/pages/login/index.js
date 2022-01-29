import React, {useState, useEffect} from "react"
import { Link as RouterLink } from 'react-router-dom';
import axios from "axios"
import "./index.css"
import {TextField, Link, Button, CircularProgress} from '@mui/material'
import {ThemeProvider} from '@mui/material/styles'

function Login({muiTheme, setTopBarCss}) {
  const [inputs, setInputs] = useState({'username': '', 'password': ''})
  const [error, setError] = useState({'username': false, 'password': false})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTopBarCss(0.8)
  }, [])

  const login = async () => {
    setError({'username': true, 'password': true})
    if(validateInput()) {
      try {
        setLoading(true)
        const { data } = await axios.post(`/api/login`, inputs)
        if(data.success) {
          window.location.href = "/member"
        }
        else {
          alert("Please check ID and password")
        }
      } catch(err) {
        alert("Please check ID and password")
      }
      setLoading(false)
    }
  }
  const onEnter = (e) => {
    if (e.key == 'Enter') {
      login()
    }
  }

  const validateInput = () => {
    return !(inputs.username === ''||inputs.password === '')
  }

  const inputformsx = {
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "#b8b8b8"
    },
    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "#b8b8b8"
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgb(255, 226, 66)"
    },
    "& .MuiOutlinedInput-input": {
      color: "white"
    },
    "&:hover .MuiOutlinedInput-input": {
      color: "white"
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
      color: "rgb(255, 226, 66)"
    },
    "& .MuiInputLabel-outlined": {
      color: "white"
    },
    "&:hover .MuiInputLabel-outlined": {
      color: "white"
    },
    "& .MuiInputLabel-outlined.Mui-focused": {
      color: "rgb(255, 226, 66)"
    }
  }

  return (
    <div id="loginpage" onKeyPress={(e) => onEnter(e)}>
      <div id="loginmodule">
        <div id="logintxt"><span>로그인</span></div>
        <div id="logininputform">
          <ThemeProvider theme={muiTheme.textfield}>
            <TextField
              autoFocus
              error={error.username && inputs.username === ''}
              helperText={error.username && inputs.username === '' ? "아이디를 입력해 주세요" : null}
              variant="outlined"
              id="sfusername"
              label="ID"
              value={inputs.username}
              onChange={(e) => setInputs({...inputs, 'username': e.target.value})}
              style={{width: "100%", marginBottom: error.username && inputs.username === '' ? 5 : 10}}
              sx={error.username && inputs.username === '' ? {} : inputformsx}
            />
            <TextField
              error={error.password && inputs.password === ''}
              helperText={error.password && inputs.password === '' ? "아이디를 입력해 주세요" : null}
              variant="outlined"
              id="sfpassword"
              type="password"
              label="Password"
              value={inputs.password}
              onChange={(e) => setInputs({...inputs, 'password': e.target.value})}
              style={{width: "100%", marginBottom: error.password && inputs.password === '' ? 5 : 10}}
              sx={error.password && inputs.password === '' ? {} : inputformsx}
            />
          </ThemeProvider>
        </div>
        <Button
          variant="contained"
          style={{width: '100%', height: 36, boxShadow: 'none', backgroundColor: 'orange', marginBottom: 10}}
          onClick={() => login()}
          sx={{
            "& .MuiLoadingButton-loadingIndicator .MuiCircularProgress-root": {
              color: "white",
            }
          }}
          value={50}
        >{loading ? (
          <CircularProgress
            variant="indeterminate"
            disableShrink
            sx={{ color: 'white', animationDuration: '700ms' }}
            size={24}
          />
        ) : 'Starflower 회원 인증'}</Button>
        <Link to="/register" 
          component={RouterLink}
          underline='none'
          color="rgb(181, 181, 181)"
          style={{fontSize: '13px', marginLeft: 'auto', marginRight: '6px'}}
        >회원가입</Link>
      </div>
    </div>
  )
}

export default Login