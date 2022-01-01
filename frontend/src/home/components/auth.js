import Cookie from 'js-cookie'
import jwt from "jwt-decode"

const getSession = () => {
  try {
    const result = jwt(Cookie.get('auth'))
    const decode = {
      "id": result.id,
      "name": decodeURIComponent(result.name),
      "sid": result.sid,
    }
    return decode
  } catch(err) {
    return null
  }
}
export default getSession