import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { register } from 'module'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'

//file này chứa các method để thực hiện trên collection users
class UsersService {
  // hàm nhận vào user_id và bỏ vào payload để tạo access_token
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }

  // hàm nhận vào user_id và bỏ vào payload để tạo refresh_token
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }

  private signAccessTokenAndRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async register(payload: RegisterReqBody) {
    //register nhận vào 1 payload và payload được định nghĩa là RegisterReqBody
    //payload là những gì người dùng gửi lên
    const result = await databaseService.users.insertOne(
      new User({
        ...payload, // phân rã payload
        date_of_birth: new Date(payload.date_of_birth),
        //vì User.schema.ts có date_of_birth là Date
        //nhưng mà người dùng gửi lên payload là string
        // thằng user sẽ k nhận vào confirm_password
        // bởi vì class user đã được định nghĩa là k có
        password: hashPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    return { access_token, refresh_token }
  }

  // hàm nhận vào email và vào data để xem thằng email có tồn tại hay k
  // còn việc nhận email và báo lỗi thì phải nằm bên middleware cụ thể là của
  // checkSchema của email
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    // nếu tồn tại user -> object user -> chuyển sang boolean -> true
    // nếu k có user -> null -> chuyển sang boolean -> false
    return Boolean(user)
  }

  async login(user_id: string) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id)
    return { access_token, refresh_token }
  }
}
const usersService = new UsersService()
//tạo usersService có chứa đầy đủ các method để tương tác với dữ liệu của users
export default usersService
// register({ email: 'ahihi', password: '123123' })
