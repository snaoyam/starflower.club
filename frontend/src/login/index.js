import React, {useState} from "react"
import axios from "axios"
import "./index.css"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

function Login() {
  const [inputs, setInputs] = useState({'username': '', 'password': ''})

  const login = async () => {
    try {
      const { data } = await axios.post(`/api/login`, inputs)
      if(data.success)
        window.location.href = "/member"
      else
        alert("Please check ID and password")
    } catch(err) {
      alert("Please check ID and password")
    }
  }
  const onEnter = (e) => {
    if (e.key == 'Enter') {
      login()
    }
  }

  const inputformsx = {
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "white"
    },
    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "white"
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
          <TextField
            variant="outlined"
            id="sfusername"
            label="ID"
            value={inputs.username}
            onChange={(e) => setInputs({...inputs, 'username': e.target.value})}
            style={{width: "100%", marginBottom: 10}}
            sx={inputformsx}
          />
          <TextField
            variant="outlined"
            id="sfpassword"
            type="password"
            label="Password"
            value={inputs.password}
            onChange={(e) => setInputs({...inputs, 'password': e.target.value})}
            style={{width: "100%", marginBottom: 10}}
            sx={inputformsx}
          />
        </div>
        <Button
          label="Password"
          variant="contained"
          color="primary"
          style={{width: '100%', height: 36, boxShadow: 'none', backgroundColor: 'orange'}}
          onClick={() => login()}
        >Starflower 회원 인증</Button>
      </div>
    </div>
  )
}

export default Login