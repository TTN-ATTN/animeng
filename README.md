# Đồ án cuối kì môn lập trình web:
## Thành viên:
- 23521087 - Phan Bình Nhẫn - 2pi4rin7
- 23521090 - Trần Trung Nhân - TTN-ATTN
- 23520492 - Trần Hiếu - anotherme13

# ANIMENG
English learning website for kids, inspired by Duolingo

## Cài đặt các thư viện yêu cầu: 
- [NodeJs](https://nodejs.org/en/download)
- Các thư viện package cần cài đặt ở trong package.json

```
git clone https://github.com/TTN-ATTN/animeng.git
npm install
```
## Cơ sở dữ liệu
Đăng kí một tài khoản [Neon](https://neon.com/) để sử dụng database serverless postgres

Sau đó chạy command:
```
npm run db:push
```

## Cài đặt các biến môi trường:
```
DATABASE_URL="" # Neon API key

REDIRECT_URL=http://localhost:3000/home

MOMO_ACCESS_KEY="" # MoMo Access Key
MOMO_SECRET_KEY="" # MoMo Secret Key

PUBLIC_URL="" # Your Public URL

# PUBLIC_URL=http://localhost:3000
AUTH_SECRET="" # Your Auth Secret Key.
# Example: 123kasdl213lkjasdn1l23kj
HUGGINGFACE_TOKEN="" # Hugging Face Token
GOOGLE_CLIENT_SECRET= # Your client secret from Google Cloud Console
GOOGLE_CLIENT_ID= # Your client ID from Google Cloud Console

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER="" # Your email address
SMTP_PASS="" # Your email password or app password
SMTP_FROM="" # Your email address
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Sau khi thiết lập đầy đủ các biến môi trường, copy file **.env.copy** thành file **.env**

## Chạy ở local
Hãy đảm bảo rằng bạn đang chạy đúng thư mục **animeng**
sau đó sau các câu lệnh sau:
```
npm run build
npm run start
```
Truy cập vào trang web trên địa chỉ localhost của bạn http://localhost:3000

Hoặc chạy mới quyền developer:

```
npm run dev
```

## To access admin page

Get userID from clerk and add to /lib/admin.ts

![alt text](image.jpg)



