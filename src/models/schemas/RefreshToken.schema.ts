import { ObjectId } from 'mongodb'
//interface dùng để miêu tả kiểu dữ liệu
//interface không có thể dùng để tạo ra đối tượng
interface RefreshTokenType {
  _id?: ObjectId //khi tạo cũng k cần
  token: string
  created_at?: Date // k có cũng đc, khi tạo object thì ta sẽ new Date() sau
  user_id: ObjectId
  exp: number //cứ cho người dùng truyền number
  iat: number //cứ cho người dùng truyền number
}
//class dùng để tạo ra đối tượng
//class sẽ thông qua interface
//thứ tự dùng như sau
//class này < databse < service < controller < route < app.ts < server.ts < index.ts

export default class RefreshToken {
  _id?: ObjectId //khi client gửi lên thì không cần truyền _id
  // có thuộc tính _id cũng được, nếu k có thi mongo tự tạo
  token: string
  created_at: Date
  user_id: ObjectId
  exp: Date //truyền lên number nhưng phỉa lưu Date cho mongo tiện
  iat: Date //xử lý
  constructor({ _id, token, created_at, user_id, exp, iat }: RefreshTokenType) {
    this._id = _id // do id lúc khai báo là optional nên nếu đổ vào phiễu thiếu thì sẽ
    // k có _id
    this.token = token
    this.created_at = created_at || new Date() // k truyền vào thì sẽ tự tạo
    this.user_id = user_id
    this.exp = new Date(exp * 1000) //convert từ Epoch time sang Date
    this.iat = new Date(iat * 1000) //convert từ Epoch time sang Date
  }
}
