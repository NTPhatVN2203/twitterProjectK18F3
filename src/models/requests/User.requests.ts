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

export interface TokenPayLoad extends JwtPayload {
  user_id: string
  token_type: TokenType
}
