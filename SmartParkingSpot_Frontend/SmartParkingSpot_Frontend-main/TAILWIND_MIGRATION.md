# Tailwind CSS Migration Guide

## ✅ Completed Conversions

### Core Screens
1. ✅ `app/index.tsx` - Panel Selection Screen
2. ✅ `app/(driver)/index.tsx` - Driver Login
3. ✅ `app/(provider)/index.tsx` - Provider Login
4. ✅ `app/(admin)/index.tsx` - Admin Login

## 🎨 Tailwind Class Reference

### Common Patterns Used

#### Container & Layout
```tsx
className="flex-1 bg-gray-light"  // Full screen with light gray background
className="items-center mb-10"    // Center items with margin bottom
className="w-full"                 // Full width
```

#### Input Fields
```tsx
className="flex-row items-center bg-white rounded-xl px-4 mb-4 border border-gray-border shadow-sm"
```

#### Buttons
```tsx
// Primary Button (Driver)
className="bg-driver-primary rounded-xl py-4 items-center mt-2 shadow-lg"

// Primary Button (Provider)
className="bg-provider-primary rounded-xl py-4 items-center mt-2 shadow-lg"

// Primary Button (Admin)
className="bg-admin-primary rounded-xl py-4 items-center mt-2 shadow-lg"
```

#### Text Styles
```tsx
className="text-4xl font-bold text-dark mb-2"     // Title
className="text-base text-gray-medium"            // Subtitle
className="text-sm text-driver-primary font-semibold"  // Link
```

#### Icon Containers
```tsx
className="w-24 h-24 rounded-full bg-driver-light justify-center items-center mb-5"
```

## 🎯 Custom Colors Available

### Driver Panel
- `bg-driver-primary` / `text-driver-primary` - #4ECDC4
- `bg-driver-light` - rgba(78, 205, 196, 0.1)
- `border-driver-primary`

### Provider Panel
- `bg-provider-primary` / `text-provider-primary` - #45B7D1
- `bg-provider-light` - rgba(69, 183, 209, 0.1)
- `border-provider-primary`

### Admin Panel
- `bg-admin-primary` / `text-admin-primary` - #FF6B6B
- `bg-admin-light` - rgba(255, 107, 107, 0.1)
- `border-admin-primary`

### Common Colors
- `bg-gray-light` - #F8F9FA
- `text-gray-medium` - #7F8C8D
- `border-gray-border` - #E0E0E0
- `text-dark` - #2C3E50
- `bg-success` / `text-success` - #27AE60
- `bg-warning` / `text-warning` - #F39C12
- `bg-danger` / `text-danger` - #E74C3C
- `bg-info` / `text-info` - #3498DB

## 📝 Migration Pattern

### Before (StyleSheet)
```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});

<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>
```

### After (Tailwind)
```tsx
<View className="flex-1 bg-gray-light">
  <Text className="text-4xl font-bold text-dark">Hello</Text>
</View>
```

## 🔄 Remaining Screens to Convert

### Registration Screens
- [ ] `app/(driver)/register.tsx`
- [ ] `app/(provider)/register.tsx`
- [ ] `app/(admin)/register.tsx`

### Forgot Password Screens
- [ ] `app/(driver)/forgot-password.tsx`
- [ ] `app/(provider)/forgot-password.tsx`
- [ ] `app/(admin)/forgot-password.tsx`

### Dashboard Screens
- [ ] `app/(driver)/dashboard.tsx`
- [ ] `app/(provider)/dashboard.tsx`
- [ ] `app/(admin)/dashboard.tsx`

## 💡 Tips

1. **Remove StyleSheet imports** after conversion
2. **Use className prop** instead of style
3. **Combine multiple classes** with spaces
4. **Use custom colors** from tailwind.config.js
5. **contentContainerStyle** still uses inline styles for ScrollView

## 🚀 Benefits

- ✅ Less code (no StyleSheet.create)
- ✅ Faster development
- ✅ Consistent design system
- ✅ Easy to maintain
- ✅ Better readability
