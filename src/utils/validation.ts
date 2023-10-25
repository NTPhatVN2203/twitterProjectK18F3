import { error } from 'console'
import { NextFunction, Request, Response } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// hàm validate nhận vào check schema và biến nó thành 1 cái middleWare
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req) // dữ liệu sẽ đi qua từng checkSchema và lưu lỗi vào request
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorObject) {
      //lấy msg của từng lỗi ra
      const { msg } = errorObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
        //nếu xuống dc đây thi mày là lỗi 422
      }
      entityError.errors[key] = msg
    }
    next(entityError)
  }
}
