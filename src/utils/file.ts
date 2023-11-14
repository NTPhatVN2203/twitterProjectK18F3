import formidable, { File } from 'formidable'
import fs from 'fs' //thư viện giúp xử lý các đường dẫn
import path from 'path'
import { Request } from 'express'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true //cho phép tạo folder nested vào nhau
        //uploads/videos/flasdfjksjk bla bla bla
      }) //mkdirSync giúp tạo thư mục
    }
  })
  // const uploadFolderPath = path.resolve('uploads') // truy cập vào đường dẫn của
  //uploads nếu không có thì uploadFolderPath sẽ rỗng hoặc null
}

//viết thêm hàm khi nhận filename : abv.png thì chỉ lấy abv để sau này ta gán thêm đuôi .jpeg
export const getNameFromFullname = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop() //xóa phần tử cuối cùng, tức là xóa đuôi .png
  return nameArr.join('') //nối lại thành chuỗi
}

//hàm lấy đuôi mở rộng của file
export const getExtension = (filename: string) => {
  const nameArr = filename.split('.') // [videoNgocTrinhTeXe, ducati, paginale, mp4]
  return nameArr[nameArr.length - 1]
}

//hàm xử lý file mà client đã gửi lên
export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_TEMP_DIR), //lưu hình vào file uploads
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

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_VIDEO_DIR), //vì video nên mình không đi qua bước xử lý
    // trung gian nên mình sẽ k bỏ video vào temp
    maxFiles: 1,
    // keepExtensions: true,  //có lấy đuôi mở rộng không .png, .jpg "nếu file có dạng asdasd.app.mp4 thì lỗi, nên mình sẽ xử lý riêng
    maxFileSize: 50 * 1024 * 1024, //50mb
    //xài option filter để kiểm tra file có phải là video không
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('video/'))
      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        form.emit('error' as any, new Error('file khong hop le') as any)
        //as any vì bug này formidable chưa fix, khi nào hết thì bỏ as any
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!files.video) {
        return reject(new Error('video is empty'))
      }
      //trong file{originalFilename, filepath, newFilename,...}
      //vì mình đã tắt keepExtensions nên file sẽ không có đuôi extensions
      const videos = files.video as File[] //lấy ra danh sách các video đã up lên
      //duyệt qua từng video và
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string) //lấy đuôi của tên gốc
        video.newFilename += `.${ext}` //lắp đuôi vào tên mới
        //fs.renameSync(video.filepath, video.filepath + '.' + ext) //rename lại đường dẫn tên file để thêm đuôi
        fs.renameSync(video.filepath, `${video.filepath}.${ext}`) //lắp đuôi vào filepath: đường dẫn đến file mới
      })
      return resolve(files.video as File[])
      //property image của object files là 1 mảng
      //tuy nhiên chúng ta biết rằng nó chỉ có 1 phần tử thôi
      //nên chúng ta lấy tại 0 luôn
    })
  })
}
