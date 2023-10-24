//model là nơi định nghĩa dữ liệu
// file này dùng để định nghĩa kiểu dữ liệu cho các request
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}
