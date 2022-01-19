import React, {useState, useEffect} from "react"
import {Box, Grow} from '@mui/material'
import GatherElement from './element'
import "./index.css"
import Addnewicon from './addnewicon'
import axios from "../../../auth/axios"


function GatherComponent() {
  const [gatherposts, setGatherPosts] = useState([]);

  useEffect(()=>{
    axios.post(`/api/member/gather/get`)
    .then(response => {
      setGatherPosts(response.data.result)
    })
    .catch(err => {
      console.error(err)
    })
  }, [])

  console.log(gatherposts)

  return (
    <React.Fragment>
      <Box sx={{display: 'flex'}}>
        {gatherposts.map((value, index) => {
          return (<Grow in={true} timeout={500*index+200} key={'gatherposts_'+index}>{<GatherElement value={value}/>}</Grow>)
        })}
      </Box>
      <Addnewicon />
    </React.Fragment>
  )
}

export default GatherComponent