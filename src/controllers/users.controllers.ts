import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'test@gmail.com' && password === '123456') {
    return res.json({
      message: 'login successfully',
      result: [
        { name: 'Diep', yob: 1999 },
        { name: 'Phat', yob: 2004 },
        { name: 'Dang', yob: 2004 }
      ]
    })
  }
  res.status(400).json({
    message: 'login failed',
    result: []
  })
}
// any trong mô tả request chính là resBody
// RegisterReqBody chính là 1 interface dùng để định nghĩa lại thằng
// reqBody của register

//giờ thì ta đã thấy body là RegisterReqBody
//việc này sẽ giúp code nhắc ta là trong body có gì
//và ta biết đã biết chắc body là RegisterReqBody
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await usersService.register(req.body)

    return res.json({
      message: 'register successfully',
      result
    })
  } catch (error) {
    res.status(400).json({
      message: 'register failed',
      error
    })
  }
}
