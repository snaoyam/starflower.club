import React from "react"
import { Link, useLocation } from "react-router-dom"
import "./login_btn.css"
import Cookie from 'js-cookie'

const logout = () => {
  Cookie.remove("auth")
  window.location.href = "/"
}
const LoginModule = ({session}) => {
  const location = useLocation()
  if(location.pathname === '/') {
    return (
      <Link to={session ? "/member/" : "/login"} id="loginbtnp">
        <div id="loginbtn">
          <span>Members</span>
        </div>
        <div id="loginbtn_hover" className="login_dropdown"></div>
      </Link>
      )
  }
  else if(location.pathname === '/login' || !session) {
    return <></>
  }
  else {
    const btn_txt = session.name + ' / ' + session.sid
    return (
    <div id="loginbtnp">
      <div id="loginbtn">
        <span>{btn_txt}</span>
      </div>
      <div id="loginmenu" className="login_dropdown">
        <div className="dropdown_menu" onClick={logout}>
          <span>로그아웃</span>
        </div>
        <div className="dropdown_menu">
          <span>회원정보 수정</span>
        </div>
      </div>
    </div>
    )
  }
}

export default LoginModule
