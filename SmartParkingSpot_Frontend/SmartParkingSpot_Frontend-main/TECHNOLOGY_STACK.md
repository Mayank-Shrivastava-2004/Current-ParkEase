# 🛠️ Complete Technology Stack & Installation Guide

## 📋 **Technologies Used in This Project**

---

## 🔵 **FRONTEND Technologies**

### **Core Framework:**
1. **React Native** - Mobile app framework
2. **Expo** - React Native development platform
3. **TypeScript** - Type-safe JavaScript

### **UI & Styling:**
4. **NativeWind** - Tailwind CSS for React Native
5. **React Native Reanimated** - Animations
6. **Expo Linear Gradient** - Gradient backgrounds
7. **Expo Vector Icons** - Icons (@expo/vector-icons)

### **Navigation:**
8. **Expo Router** - File-based routing

### **State & Data:**
9. **Axios** - HTTP client for API calls
10. **AsyncStorage** - Local storage for React Native

### **Development Tools:**
11. **Node.js** - JavaScript runtime
12. **npm** - Package manager

---

## 🔴 **BACKEND Technologies**

### **Core Framework:**
1. **Java** - Programming language
2. **Spring Boot** - Backend framework
3. **Maven** - Build tool & dependency manager

### **Database:**
4. **H2 Database** - In-memory database (current)
5. **MySQL** - Production database (optional)

### **Security:**
6. **Spring Security** - Authentication & authorization
7. **JWT** - JSON Web Tokens for auth

### **ORM:**
8. **Hibernate** - Object-relational mapping
9. **JPA** - Java Persistence API

---

## 📥 **INSTALLATION GUIDE - Step by Step**

---

## 🟢 **STEP 1: Install Node.js & npm**

### **What is it?**
Node.js runs JavaScript on your computer. npm manages packages.

### **Download:**
🔗 https://nodejs.org/

### **Version:**
- **Recommended:** LTS version (20.x or higher)

### **Installation:**
1. Download installer
2. Run installer
3. Click "Next" → "Next" → "Install"
4. Restart computer (optional but recommended)

### **Verify Installation:**
```bash
node --version
# Should show: v20.x.x

npm --version
# Should show: 10.x.x
```

### **Status:**
- ✅ **Already installed** (tumhare system pe hai)

---

## 🟢 **STEP 2: Install Java JDK**

### **What is it?**
Java Development Kit - Backend ke liye zaruri

### **Download:**
🔗 https://www.oracle.com/java/technologies/downloads/

**OR**

🔗 https://adoptium.net/ (OpenJDK - Free)

### **Version:**
- **Required:** Java 17 or higher
- **Recommended:** Java 21 LTS

### **Installation:**
1. Download JDK installer
2. Run installer
3. Set JAVA_HOME environment variable

**Set JAVA_HOME (Windows):**
1. Search "Environment Variables"
2. Click "Environment Variables"
3. Under "System Variables" → "New"
4. Variable name: `JAVA_HOME`
5. Variable value: `C:\Program Files\Java\jdk-21` (your path)
6. Add to PATH: `%JAVA_HOME%\bin`

### **Verify Installation:**
```bash
java --version
# Should show: java version "21.x.x"

javac --version
# Should show: javac 21.x.x
```

### **Status:**
- ⚠️ **Check if installed** - Run `java --version`

---

## 🟢 **STEP 3: Install Maven**

### **What is it?**
Build tool for Java projects

### **Download:**
🔗 https://maven.apache.org/download.cgi

### **Installation:**

**Option A: Manual**
1. Download Binary zip archive
2. Extract to `C:\Program Files\Apache\maven`
3. Add to PATH: `C:\Program Files\Apache\maven\bin`

**Option B: Using Chocolatey (Easy)**
```bash
choco install maven
```

### **Verify Installation:**
```bash
mvn --version
# Should show: Apache Maven 3.x.x
```

### **Status:**
- ⚠️ **Check if installed** - Run `mvn --version`

---

## 🟢 **STEP 4: Install Git**

### **What is it?**
Version control system

### **Download:**
🔗 https://git-scm.com/download/win

### **Installation:**
1. Download installer
2. Run installer
3. Use default settings

### **Verify Installation:**
```bash
git --version
# Should show: git version 2.x.x
```

### **Status:**
- ✅ **Already installed** (likely)

---

## 🟢 **STEP 5: Install Expo CLI**

### **What is it?**
Command-line tool for Expo/React Native

### **Installation:**
```bash
npm install -g expo-cli
```

### **Verify Installation:**
```bash
expo --version
# Should show version number
```

### **Alternative (if expo-cli doesn't work):**
Expo CLI is now part of expo package, so just use:
```bash
npx expo start
```

### **Status:**
- ✅ **Already working** (tumhare project mein)

---

## 🟢 **STEP 6: Install Expo Go App (Mobile)**

### **What is it?**
Mobile app to test your React Native app

### **Download:**

**Android:**
🔗 Google Play Store → Search "Expo Go"

**iOS:**
🔗 App Store → Search "Expo Go"

### **Installation:**
1. Open Play Store/App Store
2. Search "Expo Go"
3. Install

### **Status:**
- ⚠️ **Install on your phone** for testing

---

## 🟡 **STEP 7: Install MySQL (OPTIONAL)**

### **What is it?**
Production database (currently using H2)

### **Download:**
🔗 https://dev.mysql.com/downloads/mysql/

### **Installation:**
1. Download MySQL Installer
2. Choose "Developer Default"
3. Set root password (remember it!)
4. Complete installation

### **Verify Installation:**
```bash
mysql --version
# Should show: mysql Ver 8.x.x
```

### **Status:**
- ⏳ **Optional** - H2 already working
- 📝 See `MYSQL_SETUP_GUIDE.md` for details

---

## 🟢 **STEP 8: Install VS Code (IDE)**

### **What is it?**
Code editor

### **Download:**
🔗 https://code.visualstudio.com/

### **Recommended Extensions:**
1. **ES7+ React/Redux/React-Native snippets**
2. **Prettier - Code formatter**
3. **ESLint**
4. **Java Extension Pack**
5. **Spring Boot Extension Pack**

### **Status:**
- ✅ **Already installed** (tumhare system pe)

---

## 🟢 **STEP 9: Install Android Studio (OPTIONAL)**

### **What is it?**
Android emulator for testing

### **Download:**
🔗 https://developer.android.com/studio

### **Installation:**
1. Download installer
2. Install with default settings
3. Open Android Studio
4. Install Android SDK
5. Create virtual device (emulator)

### **Status:**
- ⏳ **Optional** - Use Expo Go on phone instead

---

## 📦 **Project Dependencies (Already Installed)**

### **Frontend (`package.json`):**
```json
{
  "dependencies": {
    "expo": "~52.0.23",
    "react": "18.3.1",
    "react-native": "0.76.6",
    "expo-router": "~4.0.16",
    "nativewind": "^4.1.23",
    "axios": "^1.7.9",
    "@react-native-async-storage/async-storage": "^2.1.0",
    "react-native-reanimated": "~3.16.5",
    "expo-linear-gradient": "~14.0.1",
    "@expo/vector-icons": "^14.0.4"
  }
}
```

### **Backend (`pom.xml`):**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
    </dependency>
</dependencies>
```

---

## ✅ **Installation Checklist**

### **Essential (Must Have):**
- [x] ✅ Node.js & npm
- [ ] ⚠️ Java JDK 17+
- [ ] ⚠️ Maven
- [x] ✅ Git
- [x] ✅ VS Code
- [ ] ⚠️ Expo Go (on phone)

### **Optional (Nice to Have):**
- [ ] ⏳ MySQL
- [ ] ⏳ Android Studio
- [ ] ⏳ Postman (API testing)

---

## 🚀 **Quick Setup Commands**

### **After Installing Everything:**

**1. Frontend Setup:**
```bash
cd "c:\JAVA Springboard Internship\current work 06\SmartParkingSpot_Frontend\SmartParkingSpot_Frontend-main"

# Install dependencies (if needed)
npm install

# Start frontend
npm start
```

**2. Backend Setup:**
```bash
cd "c:\JAVA Springboard Internship\current work 06\smartParkingProjectFontendandBackend-main\backend"

# Build project
mvn clean install

# Run backend
mvn spring-boot:run
```

---

## 🔍 **Verify Everything is Working**

### **Check Node.js:**
```bash
node --version
npm --version
```

### **Check Java:**
```bash
java --version
javac --version
```

### **Check Maven:**
```bash
mvn --version
```

### **Check Git:**
```bash
git --version
```

---

## 📱 **Testing Setup**

### **Option 1: Expo Go (Recommended)**
1. Install Expo Go on phone
2. Run `npm start` in frontend
3. Scan QR code with Expo Go
4. App opens on phone

### **Option 2: Android Emulator**
1. Install Android Studio
2. Create virtual device
3. Run `npm start`
4. Press 'a' to open in Android emulator

### **Option 3: iOS Simulator (Mac only)**
1. Install Xcode
2. Run `npm start`
3. Press 'i' to open in iOS simulator

---

## 🎯 **What You NEED to Download**

### **Minimum Requirements:**

1. **Java JDK 17+** ⚠️ MUST HAVE
   - Download: https://adoptium.net/
   - For backend to run

2. **Maven** ⚠️ MUST HAVE
   - Download: https://maven.apache.org/download.cgi
   - For building backend

3. **Expo Go App** ⚠️ MUST HAVE (on phone)
   - Download from Play Store/App Store
   - For testing app

### **Already Installed:**
- ✅ Node.js
- ✅ npm
- ✅ Git
- ✅ VS Code

---

## 📚 **Helpful Links**

**Documentation:**
- React Native: https://reactnative.dev/
- Expo: https://docs.expo.dev/
- Spring Boot: https://spring.io/projects/spring-boot
- NativeWind: https://www.nativewind.dev/

**Tutorials:**
- React Native: https://reactnative.dev/docs/tutorial
- Spring Boot: https://spring.io/guides

---

## 🎉 **Summary**

### **Technology Stack:**
```
Frontend:
├── React Native (Mobile framework)
├── Expo (Development platform)
├── TypeScript (Language)
├── NativeWind (Styling)
└── Axios (API calls)

Backend:
├── Java (Language)
├── Spring Boot (Framework)
├── Maven (Build tool)
├── H2/MySQL (Database)
└── JWT (Authentication)
```

### **What to Download:**
1. ⚠️ **Java JDK 17+** (Must)
2. ⚠️ **Maven** (Must)
3. ⚠️ **Expo Go** (Must - on phone)
4. ⏳ **MySQL** (Optional)
5. ⏳ **Android Studio** (Optional)

---

**Bhai, ye sab install kar lo, phir project smoothly chalega! 🚀**
