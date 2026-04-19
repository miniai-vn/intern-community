# 🔐 GitHub OAuth Setup Guide

Hướng dẫn này giúp bạn cấu hình GitHub OAuth để đăng nhập vào Intern Community Hub.

## Bước 1: Tạo GitHub OAuth App

1. Truy cập [GitHub Developer Settings](https://github.com/settings/developers)
2. Chọn **OAuth Apps** → **New OAuth App**
3. Điền thông tin:
   - **Application name**: `Intern Community Hub` (hoặc tên tùy chọn)
   - **Homepage URL**: `http://localhost:3000` (local) hoặc URL production của bạn
   - **Application description**: `An open platform for the TD developer community to submit and discover mini-app modules`
   - **Authorization callback URL**: 
     - Local: `http://localhost:3000/api/auth/callback/github`
     - Production: `https://yourdomain.com/api/auth/callback/github`

## Bước 2: Sao chép Client ID và Client Secret

1. Sau khi tạo app, GitHub sẽ hiển thị:
   - **Client ID**
   - **Client Secret** (bấm "Generate a new client secret")

## Bước 3: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc project (nếu chưa có):

```bash
# Database (đã cấu hình sẵn)
DATABASE_URL="postgresql://td_user:td_password@localhost:5432/td_community"

# NextAuth
AUTH_SECRET="change-me-in-production-use-openssl-rand-base64-32"

# GitHub OAuth (dán từ bước 2)
AUTH_GITHUB_ID="<YOUR_CLIENT_ID>"
AUTH_GITHUB_SECRET="<YOUR_CLIENT_SECRET>"
```

### Tạo AUTH_SECRET mới (optional nhưng recommended):

```bash
openssl rand -base64 32
```

## Bước 4: Khởi động Development Server

```bash
pnpm dev
```

Truy cập `http://localhost:3000` và thử đăng nhập bằng nút **Sign in with GitHub**.

## Bước 5: Testing

1. Truy cập [http://localhost:3000/submit](http://localhost:3000/submit)
2. Bạn sẽ được redirect tới `/auth/signin`
3. Bấm nút **Sign in with GitHub**
4. Đăng nhập bằng GitHub account của bạn
5. Approve permission nếu được yêu cầu
6. Bạn sẽ được redirect về `/submit`

## Troubleshooting

### ❌ "Error: Invalid Callback URL"
- Kiểm tra Authorization callback URL trong GitHub OAuth App settings
- Local: `http://localhost:3000/api/auth/callback/github`
- Production: `https://yourdomain.com/api/auth/callback/github`

### ❌ "Error: Client ID not found"
- Kiểm tra `.env.local` có giá trị `AUTH_GITHUB_ID` không
- Kiểm tra server đã được restart sau khi thay đổi `.env.local`

### ❌ "Error: Cannot find module '.prisma/client'"
Chạy lệnh sau:
```bash
pnpm exec prisma generate
```

### ❌ Thay đổi .env.local nhưng app không nhận
Khởi động lại development server:
```bash
# Tắt server (Ctrl+C)
# Khởi động lại
pnpm dev
```

## Support

Nếu gặp vấn đề, kiểm tra:
1. [NextAuth v5 Documentation](https://next-auth.js.org/)
2. [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
3. Terminal logs của development server

---

✅ Sau khi hoàn thành, bạn có thể sử dụng tất cả tính năng yêu cầu đăng nhập!
