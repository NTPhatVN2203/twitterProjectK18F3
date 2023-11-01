import { verify } from 'crypto'
import { Router } from 'express'
import { wrap } from 'module'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'
const usersRouter = Router()
//GET: được sử dụng để lấy thông tin từ server theo URL đã cung cấp.
// get method: không có body, khi truyền dữ liệu lên thì
//        tất cả parameter đều hiển thị trên url của request -> bảo mật kém
//        tất cả dữ liệu biểu mẫu được mã hóa thành URL,
//         được nối vào action URL dưới dạng query string parameters.

//POST: gửi thông tin tới server thông qua các biểu mẫu http( ví dụ như đăng ký..).
// post method: giấy parameter trong body và mã hóa
//        dữ liệu biểu mẫu xuất hiện trong phần message body của HTTP request.
//    tăng tính bảo mật

usersRouter.get('/login', loginValidator, wrapAsync(loginController))
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*
des: verify email
method: post
path: /users/verify-email
body: {
  email_verify_token: string
}
*/
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyController))

/*
des: resend verify email
method: post
path: /users/resend-verify-email
headers: {Authorization: "Bearer access_token"}
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
des: forgot password
method: post
path: /users/forgot-password
body: {
  email: string
}
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
des: verify forgot password
method: post
path: /users/verify-forgot-password
body: {
  forgot_password_token: string
}
*/
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

export default usersRouter

/*
Description: Register new user
Path: /register
Method: POST
body: {
    name: string
    email: string
    password: string
    confirm_password: string
    date_of_birth: string theo chuẩn ISO 8601
}
*/

/*
  des: lougout
  path: /users/logout
  method: POST
  Header: {Authorization: Bearer <access_token>}
  body: {refresh_token: string}
  */
