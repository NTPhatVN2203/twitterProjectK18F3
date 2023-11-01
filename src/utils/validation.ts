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

    const errorObject = errors.mapped() // hàm giúp chúng ta lấy lỗi dưới dạng object
    const entityError = new EntityError({ errors: {} })
    for (const key in errorObject) {
      //lấy msg của từng lỗi ra
      //k dùng errorObject.key là bởi z đâu có thằng nào là thuộc tính
      // key đâu mà chấm
      const { msg } = errorObject[key] //phân rã: đi qua từng thằng key
      // phân rã msg của từng key ra rồi lưu lại
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        //chúng ta sẽ phân biệt lỗi 422 và những lỗi khác thông qua cấu trúc
        //lỗi 422 thì trong msg chỉ là 1 chuỗi
        //còn những lỗi khác sẽ có cấu trúc object {msg:   ,status:   } (giống ErrorWithStatus)
        return next(msg)
        //nếu xuống dc đây thi mày là lỗi 422
      }
      entityError.errors[key] = msg
      // khúc này gán vừa tạo key (password,...) cho thằng errors của entityError
      // vừa gán giá trị (msg) cho nó
    }
    next(entityError)
  }
}
