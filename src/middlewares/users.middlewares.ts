//ta sẽ làm chức năng đăng nhập /login
//khi mà đăng nhập, người dùng sẽ truy cập /login
//tạo ra 1 request và bỏ vào trong đó email và password
//nhét email, password vào trong req.body

import { verify } from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/models/message'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            //tìm user nào có email và password giống client đưa
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
              //throw trong async k lỗi
              // là bởi vì nó sẽ ném ra và thằng validate sẽ chụp
              // và lưu lỗi vào request
              // chứ throw chỗ này k liên quan tới thằng error handler
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
            // returnScore: true | chấm điểm
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

//interface dùng để bổ nghĩa cho object
export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        }
      },
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await usersService.checkEmailExist(value)
            if (isExist) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true // hợp lệ
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
            // returnScore: true | chấm điểm
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 8,
            max: 50
          },
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50
        },
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
            // returnScore: true | chấm điểm
          },
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
        },
        custom: {
          options: (value, { req }) => {
            //value là confirm-password vởi vì custom đang nằm trong
            // confirm-password
            // req là request hiện tại đang được gửi lên để register
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
              // lỗi này sẽ được ném ra và nằm trong request
              // sau đó nó sẽ được lấy và in ra bởi validationResult của hàm validate
            }
            return true
            //k đc thiếu return true, nếu k thì k bao giờ pass qua vòng này
          }
        }
      },
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        }, // kiểm tra xem client có gửi lên k
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1] //split để loại bỏ thằng bearer
            // cấu trúc là
            // header{
            //    Authorization: 'Bearer <access_token>'
            // }
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            // nếu xuống được đây thì tức là access_token có rồi
            // cần verify access_token và lấy payload ra lưu lại trong req
            try {
              //nếu verify thành công thì
              //decoded_authorization sẽ là decoded payload
              const decoded_authorization = await verifyToken({ token: access_token })
              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (err) {
              throw new ErrorWithStatus({
                //(error as JsonWebTokenError).message sẽ cho chuỗi `accesstoken invalid`, không đẹp lắm
                //ta sẽ viết hóa chữ đầu tiên bằng .capitalize() của lodash
                message: capitalize((err as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            //nếu verify thành công refresh_token
            //thì sẽ nhận dc decoded như sau
            //{
            //  user_id: '64e3c037241604ad6184726c',
            //  token_type: 1,
            //  iat: 1693883172,
            //  exp: 1702523172
            //}

            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value }), // trả ra decoded_refresh_token
                databaseService.refreshToken.findOne({
                  // hàm findOne trả ra 1 promise || null nên phải dùng trong await
                  // kiểm trả database có tồn
                  token: value // tại refresh_token đó k
                })
              ])
              // lỗi k có refreshToken trên server
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  // lỗi này sẽ bị throw xuống catch
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED //401
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (err) {
              //lỗi verify k thành công
              if (err instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((err as JsonWebTokenError).message),
                  status: HTTP_STATUS.UNAUTHORIZED //401
                })
              }
              // đây là ta throw lỗi mà ta bắt được từ việc k có trong database
              throw err
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
