import React from "react";
import { Link } from "react-router-dom";
import "./topbar.css";

const Topbar = () =>
<React.Fragment>
  <div className="topbar">
    <Link to="/" id="SFHomep">
      <div id="SFHome">
        <span>STARFLOWER</span>
      </div>
    </Link>
  </div>
  <div className="blank"></div>
</React.Fragment>

export default Topbar;
