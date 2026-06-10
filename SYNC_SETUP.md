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

1. เปิดไฟล์ `index.html`
2. ตรวจค่า `WEB_APP_URL`
3. วาง URL `/exec` ที่ได้จากข้อ 1 เป็นค่า `WEB_APP_URL`
4. deploy ขึ้น GitHub Pages

หน้าใช้งานสำหรับลูกค้าคือ URL root ของ GitHub Pages หรือ `index.html`

โปรเจคนี้ไม่มีหน้า `admin.html` แล้ว ข้อมูลหลังบ้านให้ดูจาก Google Sheet / ไฟล์ `.xlsx` ที่ sync ข้อมูลมาจากลูกค้าโดยตรง

## 3) ทดสอบ

1. เปิดหน้าเว็บลูกค้า
2. กรอกข้อมูลลูกค้าทดสอบ เลือกสูตร เลือก Active Oil และ Fragrance
3. กดยืนยันเพื่อส่งข้อมูลเข้า Google Sheet
4. กลับไปดู Google Sheet จะมีแท็บ `Orders` และ `Items` เพิ่มอัตโนมัติ

## หมายเหตุ

- ถ้าเน็ตหลุด ระบบจะเข้าคิวในเครื่องและ retry ให้อัตโนมัติ
- ถ้ามีคิวค้างในเครื่อง ให้เปิดหน้าเว็บเดิมอีกครั้ง ระบบจะ retry เมื่อ online
- ถ้า deploy script ใหม่ อย่าลืมอัปเดต URL `/exec` ในไฟล์ `index.html`
