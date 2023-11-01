import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, LogoutReqBody, RegisterReqBody, TokenPayLoad } from '~/models/requests/User.requests'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/models/message'
import { UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  //nếu nó vào tới đây, tức là nó đã đăng nhập thành công
  const user = req.user as User
  const user_id = user._id as ObjectId //nó là objectID
  //server phải tạo ra access và refresh token để đưa cho client
  const result = await usersService.login(user_id.toString())
  //hàm login nhận vào userID và trả về 1 access và refresh token
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}
// any trong mô tả request chính là resBody
// RegisterReqBody chính là 1 interface dùng để định nghĩa lại thằng
// reqBody của register

//giờ thì ta đã thấy body là RegisterReqBody
//việc này sẽ giúp code nhắc ta là trong body có gì
//và ta biết đã biết chắc body là RegisterReqBody
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  // lấy refresh_token từ req.body
  const { refresh_token } = req.body
  //và vào database xóa refresh_token này
  const result = await usersService.logout(refresh_token) // hàm trả ra chuỗi logout thành công
  res.json(result)
}

export const emailVerifyController = async (req: Request, res: Response) => {
  //kiểm tra user này đã verify hay
  const { user_id } = req.decoded_email_verify_token as TokenPayLoad
  const user = req.user as User
  //nếu đã verify rồi thì
  if (user.verify === UserVerifyStatus.Verified)
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  //nếu mà xuống được đây thì nghĩa user này chưa verify, chưa bị banned và khớp mã
  //mình tiến hành update verify: 1, xóa email_verify_token, update_at
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  //nếu code vào dc đây nghĩa là đã đi được tàng accessTokenValidator
  //nghĩa là trong req đã có decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayLoad
  //lấy user từ database
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  //nếu có thì tìm kiếm tra xem thằng này đã bị banned chưa
  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  //user đã verify chưa ?
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  //nếu chưa verify thì tiến hành update cho user đó mã mới
  const result = await usersService.resendEmailVerify(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  // lấy user_id từ req.user
  const { _id } = req.user as User
  //tiến hành update lại forgot_password_token
  const result = await usersService.forgotPassword((_id as ObjectId).toString())
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}
