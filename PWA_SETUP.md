# PWA Setup Guide

## การติดตั้ง PWA Icon

### วิธีที่ 1: ใช้ Online Tool (แนะนำ)

1. ไปที่ https://realfavicongenerator.net/ หรือ https://www.pwabuilder.com/imageGenerator
2. อัปโหลดรูปภาพ 512x512 หรือใหญ่กว่า (PNG format)
3. Download icons ทั้งหมด
4. วางไฟล์ใน `apps/web/public/`:
   - `icon-57.png`
   - `icon-60.png`
   - `icon-72.png`
   - `icon-76.png`
   - `icon-96.png`
   - `icon-114.png`
   - `icon-120.png`
   - `icon-128.png`
   - `icon-144.png`
   - `icon-152.png`
   - `icon-180.png`
   - `icon-192.png`
   - `icon-384.png`
   - `icon-512.png`

### วิธีที่ 2: ใช้ Placeholder Generator

1. เปิดไฟล์ `apps/web/scripts/create-placeholder-icons.html` ใน browser
2. คลิก "Generate All Icons"
3. คลิก "Download All Icons"
4. วางไฟล์ที่ download ไว้ใน `apps/web/public/`

## การทดสอบ PWA

### Development Mode
PWA จะถูก disable ใน development mode เพื่อให้ development เร็วขึ้น

### Production Mode
1. Build production:
   ```bash
   pnpm build
   pnpm start
   ```

2. เปิด browser ไปที่ `https://your-domain.com` (ต้องใช้ HTTPS)

3. **Chrome/Edge (Desktop):**
   - ดูที่ address bar จะมี icon "Install" อยู่
   - หรือไปที่ Menu (⋮) > "Install Flipping Houses"

4. **Chrome/Edge (Mobile):**
   - จะมี popup "Add to Home Screen"
   - หรือไปที่ Menu (⋮) > "Add to Home screen"

5. **Safari (iOS):**
   - ไปที่ Share button (□↑) > "Add to Home Screen"

## Checklist

- [x] manifest.json configured
- [x] Service Worker configured
- [x] Meta tags for PWA
- [x] Apple touch icons
- [ ] Icon files (ต้องสร้างเอง)
- [x] Offline support
- [x] Theme color

## Troubleshooting

### ไม่เห็น Install Button
1. ตรวจสอบว่าใช้ HTTPS (localhost ก็ได้)
2. ตรวจสอบว่า build production แล้ว
3. ตรวจสอบว่า manifest.json ถูกต้อง
4. ตรวจสอบ Console สำหรับ errors

### Icon ไม่แสดง
1. ตรวจสอบว่า icon files มีอยู่ใน `public/` folder
2. ตรวจสอบว่า manifest.json ระบุ path ถูกต้อง
3. Clear browser cache และ reload

### Service Worker ไม่ทำงาน
1. ตรวจสอบว่า `next.config.js` มี `withPWA` configured
2. ตรวจสอบ Console > Application > Service Workers
3. Unregister service worker เก่าและ reload

