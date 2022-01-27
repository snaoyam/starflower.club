import React from "react"
import { Link } from "react-router-dom"
import "./topbar.css"
import Login from "./components/login_btn"


const Topbar = ({session}) =>
<React.Fragment>
  <div className="topbar">
    <Link to="/" id="SFHomep">
      <div id="SFHome">
        <span>STARFLOWER</span>
      </div>
    </Link>
    <Login session={session}/>
  </div>
</React.Fragment>

export default Topbar
