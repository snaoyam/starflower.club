import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, {useEffect, useState} from "react";
import axios from "axios";
import TopBar from "./home/components/topbar";
import Home from "./home";
import Login from "./login";
import Member from "./member";

function App() {
  
  const Notfound = <span> 404 Not found </span>

  return (
    <BrowserRouter> 
      <TopBar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/member" element={<Member />} />
        <Route path="*" element={Notfound}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;