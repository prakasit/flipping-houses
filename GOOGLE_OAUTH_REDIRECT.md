# Google OAuth Redirect URL

## Callback URL ที่ Google จะ Redirect กลับมา

เมื่อผู้ใช้ login ด้วย Google แล้ว Google จะ redirect กลับมาที่ URL นี้:

### Development (Local)
```
http://localhost:3000/api/auth/callback/google
```

### Production
```
https://your-domain.vercel.app/api/auth/callback/google
```

## Flow การทำงาน

1. **User คลิก "Sign in with Google"**
   - ไปที่: `https://accounts.google.com/o/oauth2/v2/auth?...`
   - Google จะแสดงหน้า login

2. **User อนุญาตการเข้าถึง**
   - Google จะ redirect กลับมาที่ callback URL:
   ```
   http://localhost:3000/api/auth/callback/google?code=...&scope=...
   ```

3. **NextAuth จัดการ Authentication**
   - Route handler: `/api/auth/[...nextauth]/route.ts`
   - รับ code จาก Google
   - แลก code เป็น access token
   - ดึงข้อมูล user จาก Google
   - สร้าง/อัปเดต user ใน database
   - สร้าง session

4. **Redirect ไปที่ Dashboard**
   - หลังจาก authentication สำเร็จ
   - NextAuth จะเรียก `redirect` callback
   - Redirect ไปที่: `http://localhost:3000/dashboard`

## การตั้งค่าใน Google Cloud Console

คุณต้องเพิ่ม Authorized redirect URIs ใน Google Cloud Console:

### Development
```
http://localhost:3000/api/auth/callback/google
```

### Production
```
https://your-domain.vercel.app/api/auth/callback/google
```

## ตรวจสอบ Redirect URL

### 1. ตรวจสอบ NEXTAUTH_URL
ใน `.env.local`:
```bash
NEXTAUTH_URL="http://localhost:3000"  # สำหรับ development
```

### 2. ตรวจสอบใน Browser
เมื่อ login แล้ว ดู URL bar จะเห็น:
```
http://localhost:3000/api/auth/callback/google?code=...&scope=...
```

### 3. ตรวจสอบใน Google Cloud Console
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. เลือก OAuth 2.0 Client ID
4. ตรวจสอบ "Authorized redirect URIs"
5. ต้องมี: `http://localhost:3000/api/auth/callback/google`

## Troubleshooting

### ถ้า redirect กลับมาแล้วเกิด error

1. **ตรวจสอบ NEXTAUTH_URL**
   ```bash
   # ใน .env.local
   NEXTAUTH_URL="http://localhost:3000"  # ต้องตรงกับ URL ที่ใช้
   ```

2. **ตรวจสอบ Google OAuth Settings**
   - Authorized redirect URIs ต้องตรงกับ callback URL
   - Client ID และ Client Secret ถูกต้อง

3. **ตรวจสอบ Console Logs**
   - ดู error messages ใน terminal
   - ดู network requests ใน browser DevTools

### ถ้า redirect กลับมาที่ login page

- ตรวจสอบ `signIn` callback ว่า return `true`
- ตรวจสอบว่า user ถูกสร้างใน database
- ตรวจสอบ middleware ไม่ block การเข้าถึง

## URL Structure

```
User clicks login
  ↓
Google OAuth page
  ↓
User authorizes
  ↓
Google redirects to:
  {NEXTAUTH_URL}/api/auth/callback/google?code=...
  ↓
NextAuth processes
  ↓
Redirects to:
  {NEXTAUTH_URL}/dashboard
```

## Code Reference

### NextAuth Route Handler
```typescript
// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Redirect Callback
```typescript
// apps/web/lib/auth.ts
async redirect({ url, baseUrl }) {
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  if (new URL(url).origin === baseUrl) return url;
  return `${baseUrl}/dashboard`;  // Default redirect
}
```

