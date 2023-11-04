//model là nơi định nghĩa dữ liệu

import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'

// file này dùng để định nghĩa kiểu dữ liệu cho các request
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refresh_token: string
}
export interface VerifyEmailReqBody {
  //này là mình tự thêm
  email_verify_token: string
}
export interface ForgotPasswordReqBody {
  //tự thêm
  email: string
}

export interface ResetPasswordReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export interface TokenPayLoad extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
}
// JwtPayLoad đang thiếu user_id và token_type
//TokenPayLoad giúp chúng ta định dạng decoded_refresh_token và decoded_ authorization
//có thêm user_id và token_type, bản chất của nó đang kế thừa JwtPayLoad nên đang có
//thời gian hạn dùng và 1 số thuộc tính khác

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string //vì ngta truyền lên string dạng ISO8601, k phải date
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}
//vì đây là route patch nên ngta truyền thiếu 1 trong các prop trên cũng k sao

export interface getProfileReqParams {
  username: string
}
