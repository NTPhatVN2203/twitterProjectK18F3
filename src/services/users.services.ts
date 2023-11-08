import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { register } from 'module'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/models/message'
import { config } from 'dotenv'
import { log } from 'console'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { Follower } from '~/models/schemas/Followers.schema'
config()

//file này chứa các method để thực hiện trên collection users
class UsersService {
  // hàm nhận vào user_id và bỏ vào payload để tạo access_token
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }

  //*** hàm signRefeshToken và signAccessToken(cả 2 đều return ra 1 promise)
  //k dùng await là bởi vì đây
  //là lúc tạo hàm, chỉ khi nào thằng nào sài thì nó mới await

  // hàm nhận vào user_id và bỏ vào payload để tạo refresh_token
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.emailVerificationToken, verify },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN }
    })
  }
  //ở đây chúng ta k dùng async - await là bởi z
  // bản chất của async - await là return 1 promise
  // mà chúng ta đã tự return promise r
  private signAccessTokenAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.forgotPasswordToken, verify },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN }
    })
  }

  async register(payload: RegisterReqBody) {
    // ở đây chúng ta nên tự tạo user_id thay vì để mongoDB tự tạo
    //vì chúng ta cần user_id để ký email_verify_token
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    //register nhận vào 1 payload và payload được định nghĩa là RegisterReqBody
    //payload là những gì người dùng gửi lên
    const result = await databaseService.users.insertOne(
      new User({
        ...payload, // phân rã payload
        _id: user_id,
        email_verify_token,
        username: `user${user_id.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        //vì User.schema.ts có date_of_birth là Date
        //nhưng mà người dùng gửi lên payload là string
        // thằng user sẽ k nhận vào confirm_password
        // bởi vì class user đã được định nghĩa là k có
        password: hashPassword(payload.password)
      })
    )
    // const user_id = result.insertedId.toString() // lay ra user id từ user mới tạo
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    // lưu refresh_token vào database
    await databaseService.refreshToken.insertOne(
      //chỗ này dùng await là bởi vì insertOne trả ra 1 promise
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id) //bởi vì user_id trong RefreshToken là objectID
        //nên phải chuyển từ string qua
      })
    )
    //giả lập gửi mail
    console.log(email_verify_token)
    // ở đây chúng ta k gửi email_verify_token là bởi vì
    // nó sẽ được gửi vào email mà client đăng kí
    return { access_token, refresh_token }
  }

  // hàm nhận vào email và vào data để xem thằng email có tồn tại hay k
  // còn việc nhận email và báo lỗi thì phải nằm bên middleware cụ thể là của
  // checkSchema của email
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    // nếu tồn tại user -> object user -> chuyển sang boolean -> true
    // nếu k có user -> null -> chuyển sang boolean -> false
    return Boolean(user)
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id,
      verify
    })
    // lưu refresh_token vào database
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id) //bởi vì user_id trong RefreshToken là objectID
        //nên phải chuyển từ string qua
      })
    )
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshToken.deleteOne({ token: refresh_token })
    return { message: USERS_MESSAGES.LOGOUT_SUCCESS }
  }

  async verifyEmail(user_id: string) {
    //update user
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        // mảng bọc object $set là giúp chúng ta có thể dùng $$NOW
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
    //tạo at và rf
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })
    //lưu refresh_token vào database
    await databaseService.refreshToken.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    //return access và refresh cho client đăng nhập luôn khi verify email thành công
    return { access_token, refresh_token }
  }

  async resendEmailVerify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    //cập nhật lại user
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            email_verify_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
    //giả lập gửi mail
    console.log(email_verify_token)
    return { message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    //tạo ra hàm signForgotPasswordToken
    //tạo ra forgot_password_token
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    })
    //cập nhật vào forgot_password_token và user_id
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            forgot_password_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )

    console.log(forgot_password_token) //giả lập gửi mail
    return { message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD }
  }
  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    //dựa vào user_id tìm và cập nhật
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            password: hashPassword(password),
            forgot_password_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
    return { message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return user
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    // tiến hành cập nhật thông tin mới của user
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            ...payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return user
  }

  async follow({ user_id, followed_user_id }: { user_id: string; followed_user_id: string }) {
    //kiểm tra xem đã follow chưa
    const isFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    //nếu đã follow r thì return message là đã followed
    if (isFollowed) {
      return {
        message: USERS_MESSAGES.FOLLOWED
      }
    }
    //nếu xuống đây thì chưa followed -> ta sẽ tạo ra
    // 1 document trong collection followers
    await databaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
    return {
      message: USERS_MESSAGES.FOLLOW_SUCCESSFULLY
    }
  }

  async unfollow({ user_id, followed_user_id }: { user_id: string; followed_user_id: string }) {
    // tìm xem có đang ở trạng thái followed k
    const isFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    // nếu chưa followed thì báo là chưa
    if (isFollowed == null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    //xuống dc đây thì là đã followed rồi
    //chúng ta sẽ xóa document đó trong collection
    const result = await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    //nếu xóa thành công thì return message
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESSFULLY
    }
  }

  async changePassword({ user_id, password }: { user_id: string; password: string }) {
    //tìm user và cập nhật lại password và forgetpassword
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            password: hashPassword(password),
            forgot_password_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
    //nếu bạn muốn ngta đổi mk xong tự động đăng nhập luôn thì trả về access_token và refresh_token
    //ở đây mình chỉ cho ngta đổi mk thôi, nên trả về message
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS // trong message.ts thêm CHANGE_PASSWORD_SUCCESS: 'Change password success'
    }
  }
}

const usersService = new UsersService()
//tạo usersService có chứa đầy đủ các method để tương tác với dữ liệu của users
export default usersService
// register({ email: 'ahihi', password: '123123' })
