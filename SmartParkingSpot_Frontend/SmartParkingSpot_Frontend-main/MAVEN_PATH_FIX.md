# 🔧 Maven PATH Configuration Guide

## Current Status
✅ Maven is INSTALLED: Apache Maven 3.9.12
❌ Maven is NOT in PATH

**Current Location:**
```
C:\Users\MAYANK\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12
```

---

## 🚀 Quick Fix - Add to PATH

### **Method 1: Add Current Location to PATH**

#### **Step 1: Copy Maven Path**
```
C:\Users\MAYANK\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin
```

#### **Step 2: Add to System PATH**

1. **Open Environment Variables:**
   - Press `Windows + R`
   - Type: `sysdm.cpl`
   - Press Enter
   - Go to "Advanced" tab
   - Click "Environment Variables"

2. **Edit PATH Variable:**
   - Under "System variables" (bottom section)
   - Find and select "Path"
   - Click "Edit"
   - Click "New"
   - Paste: `C:\Users\MAYANK\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin`
   - Click "OK" → "OK" → "OK"

3. **Restart Terminal:**
   - Close ALL PowerShell/CMD windows
   - Open new PowerShell
   - Test: `mvn --version`

---

## 🎯 Better Solution - Move to Program Files

### **Why Move?**
- Downloads folder is temporary
- Better organization
- Standard location for programs

### **Steps:**

#### **Step 1: Move Maven Folder**
1. Open File Explorer
2. Go to: `C:\Users\MAYANK\Downloads\apache-maven-3.9.12-bin\`
3. Copy folder: `apache-maven-3.9.12`
4. Paste to: `C:\Program Files\Apache\maven\`
   - Create "Apache" and "maven" folders if they don't exist
5. Final path: `C:\Program Files\Apache\maven\apache-maven-3.9.12`

#### **Step 2: Set MAVEN_HOME**
1. Open Environment Variables (as above)
2. Under "System variables" → Click "New"
3. Variable name: `MAVEN_HOME`
4. Variable value: `C:\Program Files\Apache\maven\apache-maven-3.9.12`
5. Click "OK"

#### **Step 3: Add to PATH**
1. Under "System variables" → Find "Path" → Click "Edit"
2. Click "New"
3. Add: `%MAVEN_HOME%\bin`
4. Click "OK" → "OK" → "OK"

#### **Step 4: Restart & Verify**
1. Close all terminals
2. Open new PowerShell
3. Run: `mvn --version`

Should show:
```
Apache Maven 3.9.12
Maven home: C:\Program Files\Apache\maven\apache-maven-3.9.12
Java version: 18.0.2.1
```

---

## ⚡ PowerShell Quick Commands

### **Option A: Quick PATH Add (Current Session Only)**
```powershell
# Add to current session (temporary)
$env:Path += ";C:\Users\MAYANK\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin"

# Test
mvn --version
```

**Note:** This is temporary - will reset when you close PowerShell

---

### **Option B: Permanent PATH Add (PowerShell as Admin)**

```powershell
# Run PowerShell as Administrator
# Add to system PATH permanently
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\Users\MAYANK\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin",
    "Machine"
)

# Restart PowerShell and test
mvn --version
```

---

## 🎯 Recommended Approach

**I recommend Method 1 (Quick Fix) for now:**

1. Add current location to PATH
2. Test backend immediately
3. Move to Program Files later (optional)

**Steps:**
1. Windows + R → `sysdm.cpl`
2. Advanced → Environment Variables
3. System variables → Path → Edit → New
4. Add: `C:\Users\MAYANK\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin`
5. OK → OK → OK
6. Restart PowerShell
7. Test: `mvn --version`

---

## ✅ After PATH is Set

### **Test Maven:**
```bash
mvn --version
```

### **Build Backend:**
```bash
cd "c:\JAVA Springboard Internship\current work 06\smartParkingProjectFontendandBackend-main\backend"
mvn clean install
```

### **Run Backend:**
```bash
mvn spring-boot:run
```

---

## 🎉 Summary

**Current Status:**
- ✅ Maven 3.9.12 installed
- ❌ Not in PATH
- 📍 Location: Downloads folder

**Quick Fix:**
1. Add to PATH: `C:\Users\MAYANK\Downloads\apache-maven-3.9.12-bin\apache-maven-3.9.12\bin`
2. Restart terminal
3. Test: `mvn --version`

**Time Required:** 2-3 minutes

---

**Bhai, bas PATH mein add karna hai, phir Maven kaam karega! 🚀**
