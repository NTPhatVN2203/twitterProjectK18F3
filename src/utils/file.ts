import formidable, { File } from 'formidable'
import fs from 'fs' //thư viện giúp xử lý các đường dẫn
import path from 'path'
import { Request } from 'express'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  // const uploadFolderPath = path.resolve('uploads') // truy cập vào đường dẫn của
  //uploads nếu không có thì uploadFolderPath sẽ rỗng hoặc null
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true //cho phép tạo folder nested vào nhau
      //uploads/videos/flasdfjksjk bla bla bla
    }) //mkdirSync giúp tạo thư mục
  }
}

//viết thêm hàm khi nhận filename : abv.png thì chỉ lấy abv để sau này ta gán thêm đuôi .jpeg
export const getNameFromFullname = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop() //xóa phần tử cuối cùng, tức là xóa đuôi .png
  return nameArr.join('') //nối lại thành chuỗi
}

//hàm xử lý file mà client đã gửi lên
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_TEMP_DIR), //lưu hình vào file uploads
    maxFiles: 4,
    keepExtensions: true, //giữ lại đuôi mở rộng của file
    maxFileSize: 300 * 1024 * 4, // 300kb //tổng dung lượng của tất cả các file
    //xài option filter để kiểm tra file có phải là image không
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('file khong hop le') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image as File[])
      //property image của object files là 1 mảng
      //tuy nhiên chúng ta biết rằng nó chỉ có 1 phần tử thôi
      //nên chúng ta lấy tại 0 luôn
    })
  })
}
