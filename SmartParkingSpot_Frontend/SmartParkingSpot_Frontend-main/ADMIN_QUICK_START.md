# 🚀 Quick Start Guide - Admin Panel

## Running the Application

1. **Start the development server**:
   ```bash
   npm start
   # or
   npx expo start
   ```

2. **Access the Admin Panel**:
   - Navigate to the role selection screen
   - Select "Admin" role
   - Login with admin credentials
   - You'll see the enhanced dashboard

## Component Usage Examples

### 1. Using in a Tab Navigator

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboard from '@/app/(admin)/dashboard';
import { 
  ProviderManagement, 
  DriverManagement, 
  DisputeManagement, 
  AnalyticsDashboard 
} from '@/components/admin';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2D3436',
        tabBarInactiveTintColor: '#B2BEC3',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Providers" 
        component={ProviderManagement}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Drivers" 
        component={DriverManagement}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Disputes" 
        component={DisputeManagement}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

### 2. Using with Expo Router (File-based routing)

Create these files in your `app/(admin)` directory:

**app/(admin)/providers.tsx**:
```tsx
import ProviderManagement from '@/components/admin/ProviderManagement';

export default function ProvidersScreen() {
  return <ProviderManagement />;
}
```

**app/(admin)/drivers.tsx**:
```tsx
import DriverManagement from '@/components/admin/DriverManagement';

export default function DriversScreen() {
  return <DriverManagement />;
}
```

**app/(admin)/disputes.tsx**:
```tsx
import DisputeManagement from '@/components/admin/DisputeManagement';

export default function DisputesScreen() {
  return <DisputeManagement />;
}
```

**app/(admin)/analytics.tsx**:
```tsx
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export default function AnalyticsScreen() {
  return <AnalyticsDashboard />;
}
```

### 3. Linking from Dashboard Quick Actions

Update the dashboard's Quick Actions section:

```tsx
// In app/(admin)/dashboard.tsx

import { useRouter } from 'expo-router';

const router = useRouter();

// Replace the Quick Actions section with:
<TouchableOpacity 
  onPress={() => router.push('/admin/drivers')}
  className="flex-1 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4"
>
  <Ionicons name="people" size={28} color="white" />
  <Text className="text-white font-bold text-sm mt-3">Manage Drivers</Text>
  <Text className="text-white/70 text-[10px] mt-1">View & monitor all drivers</Text>
</TouchableOpacity>

<TouchableOpacity 
  onPress={() => router.push('/admin/disputes')}
  className="flex-1 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-4"
>
  <Ionicons name="alert-circle" size={28} color="white" />
  <Text className="text-white font-bold text-sm mt-3">Handle Disputes</Text>
  <Text className="text-white/70 text-[10px] mt-1">8 pending disputes</Text>
</TouchableOpacity>

<TouchableOpacity 
  onPress={() => router.push('/admin/analytics')}
  className="flex-1 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-4"
>
  <Ionicons name="stats-chart" size={28} color="white" />
  <Text className="text-white font-bold text-sm mt-3">Analytics</Text>
  <Text className="text-white/70 text-[10px] mt-1">Detailed revenue reports</Text>
</TouchableOpacity>

<TouchableOpacity 
  onPress={() => router.push('/admin/providers')}
  className="flex-1 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-4"
>
  <Ionicons name="business" size={28} color="white" />
  <Text className="text-white font-bold text-sm mt-3">Manage Providers</Text>
  <Text className="text-white/70 text-[10px] mt-1">Approve pending requests</Text>
</TouchableOpacity>
```

## Backend Integration

### Step 1: Create API Service

**services/adminApi.ts**:
```tsx
const API_URL = 'http://your-backend-url/api';

export const adminApi = {
  // Metrics
  getMetrics: async () => {
    const response = await fetch(`${API_URL}/admin/metrics`);
    return response.json();
  },

  // Providers
  getProviders: async (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/admin/providers?${params}`);
    return response.json();
  },

  approveProvider: async (id: string) => {
    const response = await fetch(`${API_URL}/admin/providers/${id}/approve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },

  rejectProvider: async (id: string, reason: string) => {
    const response = await fetch(`${API_URL}/admin/providers/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  // Drivers
  getDrivers: async (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/admin/drivers?${params}`);
    return response.json();
  },

  suspendDriver: async (id: string, reason: string) => {
    const response = await fetch(`${API_URL}/admin/drivers/${id}/suspend`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return response.json();
  },

  // Disputes
  getDisputes: async (filters?: { status?: string }) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/admin/disputes?${params}`);
    return response.json();
  },

  resolveDispute: async (id: string, resolution: string) => {
    const response = await fetch(`${API_URL}/admin/disputes/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution }),
    });
    return response.json();
  },

  // Analytics
  getBookingTrend: async (range: 'week' | 'month' | 'year') => {
    const response = await fetch(`${API_URL}/admin/analytics/bookings?range=${range}`);
    return response.json();
  },

  getRevenueTrend: async (range: 'week' | 'month' | 'year') => {
    const response = await fetch(`${API_URL}/admin/analytics/revenue?range=${range}`);
    return response.json();
  },
};
```

### Step 2: Update Components to Use API

Example for ProviderManagement:
```tsx
import { useState, useEffect } from 'react';
import { adminApi } from '@/services/adminApi';

export default function ProviderManagement() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProviders({ status: filterStatus });
      setProviders(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (provider: Provider) => {
    try {
      await adminApi.approveProvider(provider.id);
      Alert.alert('Success', 'Provider approved!');
      loadProviders(); // Refresh list
    } catch (error) {
      Alert.alert('Error', 'Failed to approve provider');
    }
  };

  // Rest of component...
}
```

## Customization Tips

### 1. Change Colors

Edit `tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'admin-primary': '#your-color',
        'admin-secondary': '#your-color',
        // ... more colors
      },
    },
  },
};
```

### 2. Add Loading States

```tsx
{loading ? (
  <View className="flex-1 justify-center items-center">
    <ActivityIndicator size="large" color="#2D3436" />
  </View>
) : (
  // Your content
)}
```

### 3. Add Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

// In your API call:
try {
  // ... API call
} catch (err) {
  setError(err.message);
}

// In your render:
{error && (
  <View className="bg-red-50 p-4 rounded-xl mb-4">
    <Text className="text-red-600">{error}</Text>
  </View>
)}
```

### 4. Add Refresh Control

```tsx
import { RefreshControl } from 'react-native';

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#2D3436"
    />
  }
>
  {/* Your content */}
</ScrollView>
```

## Testing Checklist

- [ ] Dashboard loads with all metrics
- [ ] All graphs render correctly
- [ ] Provider search works
- [ ] Provider filter works
- [ ] Approve provider action works
- [ ] Reject provider action works
- [ ] Driver list displays correctly
- [ ] Driver suspension works
- [ ] Dispute list shows all statuses
- [ ] Dispute resolution works
- [ ] Analytics time range selector works
- [ ] All animations are smooth
- [ ] Modal views open/close correctly
- [ ] Back navigation works
- [ ] Error states display properly
- [ ] Loading states show correctly

## Common Issues & Solutions

### Issue: Components not rendering
**Solution**: Make sure all imports are correct and paths match your project structure

### Issue: TypeScript errors
**Solution**: Check that all interfaces are properly defined and imported

### Issue: Animations choppy
**Solution**: Reduce the number of animated items or adjust delay timings

### Issue: Modal not closing
**Solution**: Ensure state is properly managed and onRequestClose is implemented

### Issue: Search not working
**Solution**: Verify filter logic includes all searchable fields

## Performance Optimization

1. **Use React.memo** for heavy components:
```tsx
export default React.memo(ProviderManagement);
```

2. **Virtualize long lists**:
```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={100}
/>
```

3. **Debounce search input**:
```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value) => {
    setSearchQuery(value);
  },
  300
);
```

## Need Help?

- Check the main documentation: `ADMIN_PANEL_GUIDE.md`
- Review the implementation summary: `ADMIN_IMPLEMENTATION_SUMMARY.md`
- Examine component source code for detailed implementation

---

**Happy Coding! 🚀**
