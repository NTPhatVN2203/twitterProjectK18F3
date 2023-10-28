import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'

export const loginController = async (req: Request, res: Response) => {
  //nếu nó vào tới đây, tức là nó đã đăng nhập thành công
  const { user }: any = req
  const user_id = user._id //nó là objectID
  //server phải tạo ra access và refresh token để đưa cho client
  const result = await usersService.login(user_id.toString())
  //hàm login nhận vào userID và trả về 1 access và refresh token
  return res.json({
    message: 'login successfully',
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
    message: 'register successfully',
    result
  })
}
