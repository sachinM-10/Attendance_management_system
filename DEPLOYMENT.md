# Railway.app Deployment Guide - Employee Leave & Attendance Management System

This guide outlines the exact steps to deploy this full-stack application to **Railway.app** with automatic builds and a managed MySQL database.

---

## Step 1: Create a Railway Project & MySQL Database

1. Log in to [Railway.app](https://railway.app/).
2. Click **+ New Project** -> Select **Provision MySQL**.
3. Railway will provision a dedicated MySQL instance and provide the connection credentials under the **Variables** tab (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`).

---

## Step 2: Deploy the Application Service

1. Inside your Railway project dashboard, click **+ New** -> **GitHub Repo**.
2. Select your repository: `Attendance_management_system`.
3. Railway will automatically detect [`railway.json`](file:///c:/Users/sachi/attendance_management_anti/railway.json) and build using [`backend/Dockerfile`](file:///c:/Users/sachi/attendance_management_anti/backend/Dockerfile).

---

## Step 3: Configure Environment Variables on Railway

In your Railway App Service -> Go to **Variables** tab -> Click **Raw Editor** and paste:

```env
PORT=8080
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_DRIVER=com.mysql.cj.jdbc.Driver
DB_USERNAME=${MYSQLUSER}
DB_PASSWORD=${MYSQLPASSWORD}
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971
```

*(Railway automatically links `${MYSQLHOST}`, `${MYSQLUSER}`, etc., directly from your MySQL service!)*

---

## Step 4: Generate Domain Name

1. Go to your App Service -> **Settings** tab.
2. Scroll to **Networking** -> Click **Generate Domain**.
3. Your application will be live at `https://<your-project>.up.railway.app`!

---

## Deployment Architecture on Railway

```
┌────────────────────────────────────────────────────────┐
│                   Railway Dashboard                    │
├──────────────────────────┬─────────────────────────────┤
│   MySQL Database         │   Spring Boot + React App   │
│   (Service 1)            │   (Service 2)               │
│   Port: 3306             │   Port: 8080 (HTTPS Domain) │
└──────────────────────────┴─────────────────────────────┘
```
