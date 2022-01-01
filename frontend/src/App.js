import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import React, {useEffect, useState} from "react"
import axios from "axios"
import TopBar from "./home/components/topbar"
import Home from "./home"
import Login from "./login"
import Signup from "./signup"
import Member from "./member"
import getSession from "./home/components/auth"

function App() {
  const session = getSession()
  /*
  const [catlist, setCate] = useState([])
  const [reported, setReport] = useState([])
  const [catlistshow, setCateshow] = useState(catlist)

  useEffect(() => {
    const temprep = []
    reported.forEach(v => { temprep.push(v._id) })
    const tempshow = catlist.filter(v => !temprep.includes(v._id))
    setCateshow(tempshow)

  }, [catlist])

  useEffect(() => {
    axios.get(`/api`)
    .then(response => {
      setCate(response.data)
    })
  }, [])

  const catPage = catlistshow.map((v, index) => <Route exact path={"/"+v._id} key={v._id} element={<CatPage path={v._id} name={v.category}/>}/>)
  */
  const Notfound = <span> 404 Not found </span>

  return (
    <BrowserRouter> 
      <TopBar session={session}/>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/login" element={session ? <Navigate to="/member" /> : <Login />} />
        <Route exact path="/signup" element={session ? <Navigate to="/member" /> : <Signup />} />
        <Route exact path="/member" element={session ? <Member /> : <Navigate to="/login" />} />
        <Route path="*" element={Notfound}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App