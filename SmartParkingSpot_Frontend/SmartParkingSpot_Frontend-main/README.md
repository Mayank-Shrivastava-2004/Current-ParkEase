# ParkEase - Parking Management System

A comprehensive parking management system built with React Native and Expo, featuring three distinct panels for Drivers, Providers, and Administrators.

## 🚀 Features

### 🚗 Driver Panel
**Registration Fields:**
- Name
- Email
- Password
- Phone Number

**Features:**
- Book parking slots
- View available parking spaces
- Make payments
- View booking history
- Receive notifications
- Real-time slot availability
- Filter by distance and price

### 🏢 Provider Panel
**Registration Fields:**
- Owner Name
- Parking Area Name (optional)
- Location
- Email
- Password
- Phone Number

**Features:**
- Add & manage parking slots
- Update slot availability with toggle switches
- View all bookings
- Track earnings (daily, weekly, monthly, total)
- Real-time slot management
- Set pricing per slot
- Monitor occupied vs available slots

### 👨‍💼 Admin Panel
**Registration Fields:**
- Name
- Email
- Password
- Phone Number

**Features:**
- Manage users (drivers & providers)
- Approve/block parking providers
- View system reports
- Monitor revenue
- Handle complaints
- System monitoring and control
- View comprehensive statistics
- User status management (active/blocked)

## 📱 Tech Stack

- **Framework:** React Native with Expo
- **Routing:** Expo Router (file-based routing)
- **Language:** TypeScript
- **UI Components:** React Native core components
- **Icons:** @expo/vector-icons (Ionicons)
- **State Management:** React Hooks (useState)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on your device:**
   - Scan the QR code with Expo Go app (Android/iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

## 📁 Project Structure

```
Project/
├── app/
│   ├── (admin)/
│   │   ├── _layout.tsx          # Admin navigation layout
│   │   ├── index.tsx             # Admin login screen
│   │   ├── register.tsx          # Admin registration
│   │   └── dashboard.tsx         # Admin dashboard
│   ├── (driver)/
│   │   ├── _layout.tsx          # Driver navigation layout
│   │   ├── index.tsx             # Driver login screen
│   │   ├── register.tsx          # Driver registration
│   │   └── dashboard.tsx         # Driver dashboard
│   ├── (provider)/
│   │   ├── _layout.tsx          # Provider navigation layout
│   │   ├── index.tsx             # Provider login screen
│   │   ├── register.tsx          # Provider registration
│   │   └── dashboard.tsx         # Provider dashboard
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Panel selection screen
├── components/                   # Reusable components
├── constants/                    # App constants
├── assets/                       # Images, fonts, etc.
└── package.json
```

## 🎨 Design Features

- **Modern UI/UX:** Clean, intuitive interface with smooth animations
- **Color-coded Panels:**
  - Driver: Teal (#4ECDC4)
  - Provider: Blue (#45B7D1)
  - Admin: Red (#FF6B6B)
- **Responsive Design:** Works on all screen sizes
- **Dark Mode Ready:** Themed components for future dark mode support
- **Accessibility:** Clear labels and touch targets

## 🔐 Authentication Flow

1. **Panel Selection:** Users choose their role (Driver/Provider/Admin)
2. **Login/Register:** Existing users login, new users register
3. **Dashboard:** Access role-specific features and data

## 💡 Usage

### For Drivers:
1. Select "Driver Panel" from home screen
2. Register with your details or login
3. Browse available parking slots
4. Book a slot and make payment
5. View booking history and notifications

### For Providers:
1. Select "Provider Panel" from home screen
2. Register your parking area or login
3. Add parking slots with pricing
4. Toggle slot availability
5. Monitor bookings and track earnings

### For Admins:
1. Select "Admin Panel" from home screen
2. Register admin account or login
3. Manage users and providers
4. Approve/block providers
5. View reports and system statistics

## 🔄 Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications with push notifications
- [ ] Payment gateway integration
- [ ] Google Maps integration for location
- [ ] QR code scanning for parking entry/exit
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Booking reminders
- [ ] Rating and review system

## 📊 Sample Data

The app currently uses mock data for demonstration:
- 4 parking slots with varying prices (₹40-₹100/hour)
- 3 sample users (2 active, 1 blocked)
- 3 parking providers (2 approved, 1 pending)
- Multiple bookings and notifications
- Revenue tracking across different time periods

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Built with ❤️ for efficient parking management

## 📞 Support

For support, email support@parkease.com or raise an issue in the repository.

---

**Note:** This is a frontend prototype. Backend integration and payment processing need to be implemented for production use.
