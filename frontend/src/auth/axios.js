import axios from 'axios'
import Cookie from 'js-cookie'

const config = {
  //baseURL: 'https://api.starflower.club',
  withCredentials: true,
  //xsrfCookieName: 'csrf-token',
  //xsrfHeaderName: 'CSRF-Token'
}

const Axios = axios.create(Object.assign({}, config))
Axios.interceptors
  .response.use(
    response => response,
    err => {
      if (err.response.status === 401) {
        Cookie.remove("auth")
        window.location.href = "/login"
        return Promise.resolve({ loggedIn: false })
      }

      if (err.response.status === 403) {
        alert("Forbidden")
        return Promise.resolve({ loggedIn: false })
      }

      return Promise.reject(err)
    }
  )

export default Axios