import Cookie from 'js-cookie'
import jwt from "jwt-decode"

const getSession = () => {
  try {
    const result = jwt(Cookie.get('auth'))
    if(Date.now() >= result.exp*1000) new Error('token expried')
    const decode = {
      "id": result.id,
      "name": decodeURIComponent(result.name),
      "studentid": result.studentid,
    }
    return decode
  } catch(err) {
    return null
  }
}
export default getSession