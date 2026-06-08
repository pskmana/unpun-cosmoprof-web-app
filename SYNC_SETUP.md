# UNPUN Booth Webapp Sync Setup (Google Sheet)

ไฟล์นี้ทำให้ sync ไปชีตนี้โดยตรง:

- Sheet ID: `151P8cOl1oi6r399jBJjdLErvDhtHnccaavdlki0JC9k`
- Sheet URL: https://docs.google.com/spreadsheets/d/151P8cOl1oi6r399jBJjdLErvDhtHnccaavdlki0JC9k/edit?usp=sharing

## 1) Deploy Google Apps Script

1. เปิด https://script.new
2. ลบโค้ดเดิม แล้ววางโค้ดจากไฟล์ `google-apps-script.gs`
3. กด Save (ชื่อโปรเจกต์อะไรก็ได้)
4. กด `Deploy` > `New deployment`
5. Type = `Web app`
6. Execute as = `Me`
7. Who has access = `Anyone`
8. กด Deploy แล้ว Copy URL ที่ลงท้าย `/exec`

ถ้าเคย deploy ไว้แล้ว ให้เลือก `Deploy` > `Manage deployments` > ไอคอนดินสอ แล้วเลือก `New version` ทุกครั้งหลังแก้โค้ด ไม่อย่างนั้น URL เดิมอาจยังใช้โค้ดเก่าและขึ้น error ว่า `ไม่พบฟังก์ชันของสคริปต์: doPost`

## 2) ผูกเข้าหน้าเว็บ

1. เปิดหน้าหลังบ้าน `admin.html`
2. ไป `Back Office`
3. ช่อง `Google Sheet Web App URL` วาง URL `/exec` ที่ได้จากข้อ 1
4. ระบบจะ autosave และเริ่ม sync ทันที

หน้าใช้งานสำหรับลูกค้าคือ URL root ของ GitHub Pages หรือ `index.html` ส่วน `admin.html` ใช้สำหรับพนักงาน/หลังบ้านเท่านั้น

## 3) ทดสอบ

1. เปิดหน้า `Back Office`
2. กด `Test Sync`
3. กลับไปดู Google Sheet จะมีแท็บ `Orders` และ `Items` เพิ่มอัตโนมัติ
4. ถ้าทดสอบผ่าน ให้สร้างออเดอร์จริงในหน้า Front Booth แล้วกด `Print & Save Order`

## หมายเหตุ

- ถ้าเน็ตหลุด ระบบจะเข้าคิวในเครื่องและ retry ให้อัตโนมัติ
- ถ้ามีคิวค้างในเครื่อง ให้กด `Retry Sync` ในหน้า Back Office
- ถ้า deploy script ใหม่ อย่าลืมอัปเดต URL `/exec` ใน Back Office
