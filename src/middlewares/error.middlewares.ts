import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // đây là nơi mà tất cả các lỗi trên hệ thống sẽ dồn về

  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }
  //nếu k lọt vào if ở trên thì tức là error này là lỗi mặc định
  //lỗi mặc định có cấu trúc name, message, stack mà 3 thằng này có enumerable là false
  Object.getOwnPropertyNames(err).forEach((key) => {
    //getOwnPropertyNames dùng để lấy name các key (status, message,..)
    //getOwnPropertyNames trả về 1 mảng chứa các key của err
    //bởi vì enumerable của từng key là false nên k thể chạy forin được
    Object.defineProperty(err, key, { enumerable: true })
    //cho từng enumerable của key là true
  })
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfor: omit(err, ['stack'])
  })
}
