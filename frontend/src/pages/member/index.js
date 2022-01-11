import { BrowserRouter, Routes, Route } from "react-router-dom"
import React, {useEffect, useState} from "react"
import "./index.css"
import GatherComponent from "./gather"

function Member() {
  return (
    <div id='memberpage'>
      <div id='gathercomponentp'>
        <GatherComponent />
      </div>
      <div id='component1'>
        
      </div>
    </div>
  )
}

export default Member