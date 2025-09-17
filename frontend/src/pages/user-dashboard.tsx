import { useState, useEffect } from "react";
import { 
    User01, 
    CreditCard01, 
    Activity, 
    Star01, 
    BookOpen01, 
    Settings01,
    Bell02,
    FileDownload01,
    Mail01,
    MessageCircle02
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { ProgressBarBase } from "@/components/base/progress-indicators/progress-indicators";
import { Tabs } from "@/components/application/tabs/tabs";

interface UserStats {
    profileCompletion: number;
    totalOrders: number;
    favoriteItems: number;
    rewardPoints: number;
}

interface UserActivity {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    type: "order" | "favorite" | "review" | "account";
}

interface QuickAction {
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    color: "primary" | "secondary";
}

export const UserDashboard = () => {
    const [stats] = useState<UserStats>({
        profileCompletion: 85,
        totalOrders: 12,
        favoriteItems: 8,
        rewardPoints: 450
    });

    const [activities] = useState<UserActivity[]>([
        {
            id: "1",
            title: "Order Delivered",
            description: "Your order #ORD-2024-001 has been delivered successfully",
            timestamp: "2 hours ago",
            type: "order"
        },
        {
            id: "2", 
            title: "Added to Favorites",
            description: "Wireless Headphones added to your wishlist",
            timestamp: "1 day ago",
            type: "favorite"
        },
        {
            id: "3",
            title: "Review Submitted",
            description: "Thank you for rating Smart Watch Pro",
            timestamp: "3 days ago",
            type: "review"
        },
        {
            id: "4",
            title: "Profile Updated",
            description: "Your shipping address has been updated",
            timestamp: "1 week ago",
            type: "account"
        }
    ]);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => {
            // User data loading complete
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const quickActions: QuickAction[] = [
        {
            title: "View Orders",
            description: "Track your recent purchases",
            icon: CreditCard01,
            color: "primary"
        },
        {
            title: "Browse Catalog",
            description: "Discover new products",
            icon: BookOpen01,
            color: "secondary"
        },
        {
            title: "Contact Support",
            description: "Get help with your account",
            icon: MessageCircle02,
            color: "secondary"
        },
        {
            title: "Download Invoice",
            description: "Get your purchase receipts",
            icon: FileDownload01,
            color: "secondary"
        }
    ];

    const getActivityIcon = (type: UserActivity['type']) => {
        switch (type) {
            case 'order': return CreditCard01;
            case 'favorite': return Star01;
            case 'review': return MessageCircle02;
            case 'account': return User01;
            default: return Activity;
        }
    };

    const getActivityColor = (type: UserActivity['type']) => {
        switch (type) {
            case 'order': return "success";
            case 'favorite': return "warning";
            case 'review': return "brand";
            case 'account': return "gray";
            default: return "gray";
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Header */}
            <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-display-sm font-semibold text-fg-primary">My Dashboard</h1>
                        <p className="mt-1 text-md text-fg-tertiary">Welcome back, John! Here's your personal overview.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ButtonUtility
                            icon={Bell02}
                            tooltip="Notifications"
                            color="secondary"
                        />
                        <ButtonUtility
                            icon={Mail01}
                            tooltip="Messages"
                            color="secondary"
                        />
                        <ButtonUtility
                            icon={Settings01}
                            tooltip="Account Settings"
                            color="secondary"
                        />
                        <Avatar
                            size="sm"
                            initials="JD"
                            status="online"
                        />
                    </div>
                </div>
            </header>

            <main className="p-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Profile Completion */}
                    <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-fg-tertiary">Profile Completion</p>
                                <p className="mt-2 text-display-xs font-semibold text-fg-primary">{stats.profileCompletion}%</p>
                            </div>
                            <div className="rounded-lg bg-bg-secondary p-3">
                                <User01 className="size-6 text-fg-secondary" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <ProgressBarBase value={stats.profileCompletion} className="h-2" />
                            <p className="mt-2 text-sm text-fg-tertiary">Complete your profile to unlock rewards</p>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-fg-tertiary">Total Orders</p>
                                <p className="mt-2 text-display-xs font-semibold text-fg-primary">{stats.totalOrders}</p>
                            </div>
                            <div className="rounded-lg bg-bg-secondary p-3">
                                <CreditCard01 className="size-6 text-fg-secondary" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Badge type="color" color="success" size="sm">
                                Active Customer
                            </Badge>
                        </div>
                    </div>

                    {/* Favorite Items */}
                    <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-fg-tertiary">Wishlist Items</p>
                                <p className="mt-2 text-display-xs font-semibold text-fg-primary">{stats.favoriteItems}</p>
                            </div>
                            <div className="rounded-lg bg-bg-secondary p-3">
                                <Star01 className="size-6 text-fg-secondary" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button color="secondary" size="sm" className="w-full">
                                View Wishlist
                            </Button>
                        </div>
                    </div>

                    {/* Reward Points */}
                    <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-fg-tertiary">Reward Points</p>
                                <p className="mt-2 text-display-xs font-semibold text-fg-primary">{stats.rewardPoints}</p>
                            </div>
                            <div className="rounded-lg bg-bg-secondary p-3">
                                <Activity className="size-6 text-fg-secondary" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Badge type="color" color="warning" size="sm">
                                50 pts to next reward
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="mt-8">
                    <Tabs>
                        <Tabs.List
                            items={[
                                { id: "activity", children: "Recent Activity" },
                                { id: "orders", children: "My Orders" },
                                { id: "account", children: "Account" }
                            ]}
                        />

                        <Tabs.Panel id="activity" className="mt-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Recent Activity */}
                                <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                                    <h3 className="text-lg font-semibold text-fg-primary">Recent Activity</h3>
                                    
                                    <div className="mt-4 space-y-4">
                                        {activities.map((activity) => {
                                            const IconComponent = getActivityIcon(activity.type);
                                            return (
                                                <div key={activity.id} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="rounded-lg bg-bg-secondary p-2">
                                                            <IconComponent className="size-4 text-fg-secondary" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-fg-primary">{activity.title}</p>
                                                        <p className="text-sm text-fg-secondary">{activity.description}</p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge 
                                                                type="color" 
                                                                color={getActivityColor(activity.type)} 
                                                                size="sm"
                                                            >
                                                                {activity.type}
                                                            </Badge>
                                                            <span className="text-xs text-fg-tertiary">{activity.timestamp}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                                    <h3 className="text-lg font-semibold text-fg-primary">Quick Actions</h3>
                                    <div className="mt-4 space-y-3">
                                        {quickActions.map((action, index) => (
                                            <Button
                                                key={index}
                                                color={action.color}
                                                size="md"
                                                iconLeading={action.icon}
                                                className="w-full justify-start"
                                            >
                                                <div className="text-left">
                                                    <div className="font-medium">{action.title}</div>
                                                    <div className="text-xs opacity-75">{action.description}</div>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Tabs.Panel>

                        <Tabs.Panel id="orders" className="mt-6">
                            <div className="rounded-lg border border-border-secondary bg-bg-primary p-8 text-center shadow-xs">
                                <CreditCard01 className="mx-auto size-12 text-fg-tertiary" />
                                <h3 className="mt-4 text-lg font-semibold text-fg-primary">Order History</h3>
                                <p className="mt-2 text-fg-tertiary">View and track all your orders in one place.</p>
                                <Button color="primary" size="md" className="mt-4">
                                    View All Orders
                                </Button>
                            </div>
                        </Tabs.Panel>

                        <Tabs.Panel id="account" className="mt-6">
                            <div className="rounded-lg border border-border-secondary bg-bg-primary p-8 text-center shadow-xs">
                                <Settings01 className="mx-auto size-12 text-fg-tertiary" />
                                <h3 className="mt-4 text-lg font-semibold text-fg-primary">Account Settings</h3>
                                <p className="mt-2 text-fg-tertiary">Manage your profile, preferences, and security settings.</p>
                                <Button color="primary" size="md" className="mt-4">
                                    Manage Account
                                </Button>
                            </div>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};