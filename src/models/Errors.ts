//đầu file

import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from './message'

//tạo kiểu lỗi giống thiết kế ban đâu
//ErorsType đang định dạng cho thằng errors của EntityError
type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any //này nghĩa ra ngoài ra muốn thêm vào gì thì thêm
  }
>

//ở đây thường mình sẽ extend Error để nhận đc báo lỗi ở dòng nào

//cái khuôn để tạo ra object để mô tả lỗi có status
export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

// EntityError là dành riêng cho thằng validation error
// dùng để hiển thị lỗi có cấu trúc dễ nhìn và hiệu quả
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  //truyển message mặt định
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY }) //tạo lỗi có status 422
    this.errors = errors
  }
}
/*
tạo ra EntityError như sau
message: 
status: 
errors: 
*/
