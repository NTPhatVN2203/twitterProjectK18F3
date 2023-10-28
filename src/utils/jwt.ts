import jwt, { JwtPayload } from 'jsonwebtoken'
import { config } from 'dotenv'
import { TokenPayLoad } from '~/models/requests/User.requests'

//làm hàm nhận vào payload, privateKey và options
// từ đó ký tên
// hàm tạo token

//hàm k nhận vào callback bởi z dành callBack đó để tự viết
//chức năng xử lý và ném lỗi nếu trong quá trình ký tên

//hàm nhận vào object nên khi truyền dữ liệu(truyền object), có sai vị trị hay thiếu
// thì cũng k sao
// hàm này ta thiết kế chỉ cần đưa payload vào là đủ
// thiếu privateKey hay Options thì nó sẽ dùng những thằng mặc định đã được gán
export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  //privateKey là password để được quyền tạo chữ ký jwt
  //privateKey để mặc định để khi nào cần kí thì lấy ra kí luôn
  options = { algorithm: 'HS256' }
}: {
  payload: string | object | Buffer
  privateKey?: string
  options?: jwt.SignOptions
}) => {
  //sau khi kí tên sẽ tạo ra token
  //mà token là string
  //nên định nghĩa luôn là Promise trả về string
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      //sign là hàm tiện ích của jwt
      if (err) throw reject(err)
      resolve(token as string)
    })
  })
  //cái này là server nó phục vụ cho mình (người code) chứ k phải cho người dùng
  //để phải reject để mình bt nếu có lỗi thì còn fix
}

export const verifyToken = ({
  token,
  secretOnPublicKey = process.env.JWT_SECRET as string
}: {
  token: string
  secretOnPublicKey?: string
}) => {
  return new Promise<TokenPayLoad>((resolve, reject) => {
    jwt.verify(token, secretOnPublicKey, (err, decoded) => {
      if (err) throw reject(err)
      resolve(decoded as TokenPayLoad) //payload = decode
    })
  })
}
