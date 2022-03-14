import React, {useState, useEffect} from "react"
import {Box, Grow} from '@mui/material'
import GatherElement from './element'
import Addnewicon from './addnewicon'
import axios from "../../../auth/axios"


function GatherComponent() {
  const [gatherposts, setGatherPosts] = useState([]);
  
  const refreshposts = () => {
    axios.post(`/api/member/gather/get`)
    .then(response => {
      setGatherPosts(response.data.result)
    })
    .catch(err => {
      console.error(err)
    })
  }

  useEffect(()=>{
    refreshposts()
  }, [])

  return (
    <Box sx={{
      'position': 'relative',
    }}>
      <Box sx={{
        'display': 'flex',
        'padding': '0',
        'overflowX': 'scroll',
        'margin': '0 max(calc(-0.3vw - 5px), -15px)',
      }}>
        {gatherposts.map((value, index) => {
          return (<Grow in={true} timeout={500*index+200} key={'gatherposts_'+index}>{<GatherElement value={value}/>}</Grow>)
        })}
      </Box>
      <Addnewicon refreshposts={refreshposts}/>
    </Box>
  )
}

export default GatherComponent