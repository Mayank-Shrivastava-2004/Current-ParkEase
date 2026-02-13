import { Ionicons } from '@expo/vector-icons';
import { Link, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WebLayoutProps {
    children: React.ReactNode;
}

export default function WebLayout({ children }: WebLayoutProps) {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { label: 'Home', route: '/' },
        { label: 'Drivers', route: '/(driver)' },
        { label: 'Providers', route: '/(provider)' },
        { label: 'Admin', route: '/(admin)' },
    ];

    // Role Navigation Config
    const roleNavs: Record<string, { label: string; icon: string; route?: string }[]> = {
        '/(admin)': [
            { label: 'Overview', icon: 'stats-chart', route: 'dashboard' },
            { label: 'Users', icon: 'people', route: 'users' },
            { label: 'Settings', icon: 'settings', route: 'settings' },
        ],
        '/(driver)': [
            { label: 'Find Spot', icon: 'map', route: 'dashboard' },
            { label: 'My Bookings', icon: 'ticket', route: 'bookings' },
            { label: 'Wallet', icon: 'wallet', route: 'wallet' },
        ],
        '/(provider)': [
            { label: 'My Lot', icon: 'business', route: 'dashboard' },
            { label: 'Earnings', icon: 'cash', route: 'earnings' },
            { label: 'Manage', icon: 'construct', route: 'manage' },
        ]
    };

    // Determine current active section
    const activeSection = Object.keys(roleNavs).find(key => pathname.startsWith(key));
    const sidebarItems = activeSection ? roleNavs[activeSection] : [];

    // Breadcrumb Logic
    const getBreadcrumbs = () => {
        if (pathname === '/') return [];

        const segments = pathname.split('/').filter(Boolean);
        const crumbs = [{ label: 'Home', path: '/' }];

        // Handle Role Root
        if (activeSection) {
            const roleLabel = activeSection.replace('/(', '').replace(')', '');
            crumbs.push({
                label: roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1),
                path: activeSection
            });
        }

        return crumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <View className="flex-1 bg-gray-50 h-screen">
            {/* Top Navigation Bar */}
            <View
                style={{ paddingTop: insets.top }}
                className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50"
            >
                <View className="max-w-[1400px] mx-auto px-6 h-16 flex-row items-center justify-between w-full">
                    {/* Logo Area */}
                    <Link href="/" asChild>
                        <TouchableOpacity className="cursor-pointer">
                            <Text className="text-2xl font-black text-dark-900 tracking-tighter flex-row items-center">
                                ParkEase<Text className="text-teal-500">.</Text>
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    {/* Desktop Navigation */}
                    <View className="hidden md:flex flex-row items-center gap-8">
                        {navItems.map((item) => {
                            const isActive = pathname === item.route || (item.route !== '/' && pathname.startsWith(item.route));
                            return (
                                <Link key={item.route} href={item.route as any} asChild>
                                    <TouchableOpacity className="cursor-pointer">
                                        <Text
                                            className={`text-sm font-medium transition-colors ${isActive ? 'text-teal-600 font-bold' : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                </Link>
                            );
                        })}
                    </View>

                    {/* Mobile Menu Icon */}
                    <TouchableOpacity
                        className="md:hidden p-2 -mr-2"
                        onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Ionicons name={isMobileMenuOpen ? "close" : "menu"} size={26} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <View className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-40 md:hidden">
                        <View className="p-4 gap-2">
                            {navItems.map((item) => (
                                <Link key={item.route} href={item.route as any} asChild onPress={() => setIsMobileMenuOpen(false)}>
                                    <TouchableOpacity className="flex-row items-center p-3 rounded-xl bg-gray-50">
                                        <Text className="font-bold text-gray-700">{item.label}</Text>
                                    </TouchableOpacity>
                                </Link>
                            ))}

                            {/* Mobile Sidebar Items if active */}
                            {sidebarItems.length > 0 && (
                                <View className="mt-4 pt-4 border-t border-gray-100">
                                    <Text className="text-[10px] uppercase font-bold text-gray-400 mb-2">Section Menu</Text>
                                    {sidebarItems.map((item, idx) => (
                                        <View key={idx} className="flex-row items-center p-3">
                                            <Ionicons name={item.icon as any} size={18} color="#64748b" />
                                            <Text className="ml-3 text-sm font-medium text-slate-600">{item.label}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </View>

            <View className="flex-1 w-full max-w-[1400px] mx-auto flex-row">
                {/* Sidebar (Desktop Only) */}
                {sidebarItems.length > 0 && (
                    <View className="hidden md:flex w-64 bg-white border-r border-gray-100 h-full py-8 px-4">
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 px-2">
                            {activeSection?.replace('/(', '').replace(')', '')} Menu
                        </Text>
                        <View className="gap-2">
                            {sidebarItems.map((item, idx) => (
                                <View key={idx} className={`flex-row items-center px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-50 ${idx === 0 ? 'bg-teal-50/50' : ''}`}>
                                    <Ionicons name={item.icon as any} size={18} color={idx === 0 ? '#0d9488' : '#64748b'} />
                                    <Text className={`ml-3 text-sm font-medium ${idx === 0 ? 'text-teal-700' : 'text-slate-600'}`}>{item.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Main Content Area */}
                <View className="flex-1 h-full overflow-hidden flex flex-col">
                    {/* Breadcrumbs */}
                    {breadcrumbs.length > 0 && (
                        <View className="px-6 pt-6 pb-2 flex-row items-center gap-2">
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={crumb.path}>
                                    <Link href={crumb.path as any} asChild>
                                        <Text className="text-sm font-medium text-gray-400 hover:text-teal-600 hover:underline cursor-pointer">
                                            {crumb.label}
                                        </Text>
                                    </Link>
                                    {idx < breadcrumbs.length && (
                                        <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
                                    )}
                                </React.Fragment>
                            ))}
                            {/* Current Page Label (simplified logic for now) */}
                            {pathname.split('/').filter(Boolean).length > 0 && !pathname.endsWith('/') && (
                                <Text className="text-sm font-bold text-gray-800">
                                    {pathname.split('/').pop()?.replace('-', ' ')}
                                </Text>
                            )}
                        </View>
                    )}

                    {children}
                </View>
            </View>
        </View>
    );
}
