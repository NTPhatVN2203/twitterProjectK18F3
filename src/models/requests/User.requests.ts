//model là nơi định nghĩa dữ liệu

import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'

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
}
// JwtPayLoad đang thiếu user_id và token_type
//TokenPayLoad giúp chúng ta định dạng decoded_refresh_token và decoded_ authorization
//có thêm user_id và token_type, bản chất của nó đang kế thừa JwtPayLoad nên đang có
//thời gian hạn dùng và 1 số thuộc tính khác
