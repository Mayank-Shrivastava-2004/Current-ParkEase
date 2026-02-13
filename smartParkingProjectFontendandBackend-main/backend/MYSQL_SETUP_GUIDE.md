# 🗄️ MySQL Database Setup Guide

## Current Status
Abhi backend **H2 database** (in-memory) use kar raha hai. Ye temporary hai - server restart hone pe sab data delete ho jata hai.

**MySQL** use karne ke liye ye steps follow karo:

---

## 📋 Prerequisites

### 1. MySQL Install Karo
Agar MySQL installed nahi hai to download karo:
- **Download Link**: https://dev.mysql.com/downloads/mysql/
- **Recommended**: MySQL Community Server 8.0+

**Installation:**
- Windows: MySQL Installer download karo aur install karo
- Default port: `3306`
- Root password set karo (yaad rakhna!)

---

## 🔧 Step-by-Step Setup

### Step 1: MySQL Service Start Karo

**Windows:**
```bash
# MySQL service check karo
net start MySQL80

# Agar running nahi hai to start karo
net start MySQL80
```

**Alternative:** MySQL Workbench use kar sakte ho

---

### Step 2: Database Create Karo

**Option A: Command Line**
```bash
# MySQL login karo
mysql -u root -p
# Password enter karo

# Database create karo
CREATE DATABASE parkease;

# Check karo
SHOW DATABASES;

# Exit karo
exit;
```

**Option B: MySQL Workbench**
1. MySQL Workbench open karo
2. Local connection select karo
3. Query tab mein ye run karo:
   ```sql
   CREATE DATABASE parkease;
   ```

---

### Step 3: Backend Configuration Update Karo

**File:** `backend/src/main/resources/application.properties`

**Current (H2):**
```properties
spring.datasource.url=jdbc:h2:mem:parkease;DB_CLOSE_DELAY=-1
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
```

**Update to (MySQL):**
```properties
# ===============================
# DATABASE (MySQL for Production)
# ===============================
spring.datasource.url=jdbc:mysql://localhost:3306/parkease?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect

# ===============================
# JPA / HIBERNATE
# ===============================
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

# ===============================
# LOGGING
# ===============================
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

**Important:**
- Replace `YOUR_MYSQL_PASSWORD` with your actual MySQL root password
- Database name: `parkease`
- Port: `3306` (default MySQL port)

---

### Step 4: Check Maven Dependencies

**File:** `backend/pom.xml`

MySQL driver already hona chahiye. Check karo:

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

Agar nahi hai to add karo.

---

### Step 5: Backend Restart Karo

```bash
cd "c:\JAVA Springboard Internship\current work 06\smartParkingProjectFontendandBackend-main\backend"

# Maven clean and run
mvn clean install
mvn spring-boot:run
```

---

## ✅ Verification

### Check 1: Console Logs
Backend start hone pe ye dikhna chahiye:
```
Hibernate: create table users (...)
Hibernate: create table parking_slots (...)
...
Started BackendApplication in X seconds
```

### Check 2: MySQL Workbench
```sql
USE parkease;
SHOW TABLES;
```

Ye tables dikhne chahiye:
- `users`
- `parking_slots`
- `bookings`
- `providers`
- `notifications`
- etc.

### Check 3: Test API
```bash
# Health check
curl http://localhost:8080/api/health
```

---

## 🔄 H2 vs MySQL Comparison

| Feature | H2 (Current) | MySQL (Recommended) |
|---------|--------------|---------------------|
| **Type** | In-memory | Persistent |
| **Data Persistence** | ❌ Lost on restart | ✅ Saved permanently |
| **Production Ready** | ❌ No | ✅ Yes |
| **Setup** | ✅ Easy | ⚠️ Requires installation |
| **Performance** | Fast (memory) | Good (disk) |
| **Use Case** | Development/Testing | Production |

---

## 🚨 Common Issues & Solutions

### Issue 1: "Access denied for user 'root'"
**Solution:**
- Check MySQL password in `application.properties`
- Make sure MySQL service is running
- Try resetting MySQL root password

### Issue 2: "Communications link failure"
**Solution:**
- Check if MySQL is running: `net start MySQL80`
- Verify port 3306 is not blocked
- Check firewall settings

### Issue 3: "Unknown database 'parkease'"
**Solution:**
```sql
CREATE DATABASE parkease;
```

### Issue 4: "Driver class not found"
**Solution:**
- Check `pom.xml` has MySQL dependency
- Run `mvn clean install`

---

## 📝 Quick Setup Commands

```bash
# 1. Start MySQL
net start MySQL80

# 2. Create Database
mysql -u root -p
CREATE DATABASE parkease;
exit;

# 3. Update application.properties (manual)

# 4. Restart Backend
cd "c:\JAVA Springboard Internship\current work 06\smartParkingProjectFontendandBackend-main\backend"
mvn clean spring-boot:run
```

---

## 🎯 Recommendation

### For Development (Current):
✅ **Keep H2** - Fast, easy, no setup needed

### For Production/Testing with Real Data:
✅ **Use MySQL** - Data persists, production-ready

### Best Approach:
Use **profiles** to switch between H2 and MySQL:

**application-dev.properties** (H2):
```properties
spring.datasource.url=jdbc:h2:mem:parkease
```

**application-prod.properties** (MySQL):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/parkease
```

Run with profile:
```bash
# Development
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Production
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## 🎉 Summary

**Option 1: Continue with H2** (Easy)
- ✅ No setup needed
- ✅ Fast development
- ❌ Data lost on restart

**Option 2: Switch to MySQL** (Recommended for Production)
- ✅ Data persists
- ✅ Production ready
- ⚠️ Requires MySQL installation

---

**Tumhara choice hai bhai! Development ke liye H2 theek hai, but agar data save rakhna hai to MySQL use karo! 🚀**
