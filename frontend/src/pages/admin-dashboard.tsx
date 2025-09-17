import { useState, useEffect } from "react";
import { 
    BarChart01, 
    Calendar, 
    CurrencyDollar, 
    Users01, 
    TrendUp01, 
    TrendDown01, 
    Settings01,
    Bell02,
    Download01
} from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";
import { Table } from "@/components/application/table/table";
import { Tabs } from "@/components/application/tabs/tabs";

interface DashboardStats {
    totalRevenue: number;
    activeUsers: number;
    conversionRate: number;
    totalOrders: number;
}

interface RecentActivity {
    id: string;
    user: string;
    action: string;
    timestamp: string;
    status: "success" | "warning" | "error";
}

export const Dashboard = () => {
    const [stats] = useState<DashboardStats>({
        totalRevenue: 45231.89,
        activeUsers: 2350,
        conversionRate: 10.1,
        totalOrders: 405
    });

    const [activities] = useState<RecentActivity[]>([
        {
            id: "1",
            user: "John Doe",
            action: "Completed purchase",
            timestamp: "2 minutes ago",
            status: "success"
        },
        {
            id: "2", 
            user: "Sarah Wilson",
            action: "Updated profile",
            timestamp: "5 minutes ago",
            status: "success"
        },
        {
            id: "3",
            user: "Mike Johnson",
            action: "Failed payment",
            timestamp: "8 minutes ago",
            status: "error"
        },
        {
            id: "4",
            user: "Lisa Chen",
            action: "Viewed product",
            timestamp: "12 minutes ago",
            status: "warning"
        }
    ]);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => {
            // Loading simulation complete
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const statCards = [
        {
            title: "Total Revenue",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            change: "+20.1%",
            changeType: "positive" as const,
            icon: CurrencyDollar
        },
        {
            title: "Active Users",
            value: stats.activeUsers.toLocaleString(),
            change: "+180.1%",
            changeType: "positive" as const,
            icon: Users01
        },
        {
            title: "Conversion Rate",
            value: `${stats.conversionRate}%`,
            change: "+19%",
            changeType: "positive" as const,
            icon: TrendUp01
        },
        {
            title: "Total Orders",
            value: stats.totalOrders.toLocaleString(),
            change: "-4.3%",
            changeType: "negative" as const,
            icon: TrendDown01
        }
    ];

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Header */}
            <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-display-sm font-semibold text-fg-primary">Dashboard</h1>
                        <p className="mt-1 text-md text-fg-tertiary">Welcome back! Here's what's happening with your business today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ButtonUtility
                            icon={Bell02}
                            tooltip="Notifications"
                            color="secondary"
                        />
                        <ButtonUtility
                            icon={Settings01}
                            tooltip="Settings"
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
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, index) => (
                        <div key={index} className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-fg-tertiary">{stat.title}</p>
                                    <p className="mt-2 text-display-xs font-semibold text-fg-primary">{stat.value}</p>
                                </div>
                                <div className="rounded-lg bg-bg-secondary p-3">
                                    <stat.icon className="size-6 text-fg-secondary" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center">
                                <BadgeWithIcon
                                    type="color"
                                    color={stat.changeType === "positive" ? "success" : "error"}
                                    size="sm"
                                    iconLeading={stat.changeType === "positive" ? TrendUp01 : TrendDown01}
                                >
                                    {stat.change}
                                </BadgeWithIcon>
                                <span className="ml-2 text-sm text-fg-tertiary">from last month</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Tabs */}
                <div className="mt-8">
                    <Tabs>
                        <Tabs.List
                            items={[
                                { id: "overview", children: "Overview" },
                                { id: "analytics", children: "Analytics" },
                                { id: "reports", children: "Reports" }
                            ]}
                        />

                        <Tabs.Panel id="overview" className="mt-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Recent Activity */}
                                <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-fg-primary">Recent Activity</h3>
                                        <Button
                                            color="secondary"
                                            size="sm"
                                            iconLeading={Download01}
                                        >
                                            Export
                                        </Button>
                                    </div>
                                    
                                    <Table className="mt-4" size="sm">
                                        <Table.Header>
                                            <Table.Head>User</Table.Head>
                                            <Table.Head>Action</Table.Head>
                                            <Table.Head>Time</Table.Head>
                                            <Table.Head>Status</Table.Head>
                                        </Table.Header>
                                        <Table.Body items={activities}>
                                            {(activity) => (
                                                <Table.Row key={activity.id}>
                                                    <Table.Cell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar
                                                                size="xs"
                                                                initials={activity.user.split(' ').map(n => n[0]).join('')}
                                                            />
                                                            <span className="font-medium text-fg-primary">{activity.user}</span>
                                                        </div>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <span className="text-fg-secondary">{activity.action}</span>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <span className="text-fg-tertiary">{activity.timestamp}</span>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        <Badge
                                                            type="color"
                                                            color={
                                                                activity.status === "success" ? "success" :
                                                                activity.status === "warning" ? "warning" : "error"
                                                            }
                                                            size="sm"
                                                        >
                                                            {activity.status}
                                                        </Badge>
                                                    </Table.Cell>
                                                </Table.Row>
                                            )}
                                        </Table.Body>
                                    </Table>
                                </div>

                                {/* Quick Actions */}
                                <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                                    <h3 className="text-lg font-semibold text-fg-primary">Quick Actions</h3>
                                    <div className="mt-4 space-y-3">
                                        <Button
                                            color="primary"
                                            size="md"
                                            iconLeading={Users01}
                                            className="w-full justify-start"
                                        >
                                            Add New User
                                        </Button>
                                        <Button
                                            color="secondary"
                                            size="md"
                                            iconLeading={BarChart01}
                                            className="w-full justify-start"
                                        >
                                            Generate Report
                                        </Button>
                                        <Button
                                            color="secondary"
                                            size="md"
                                            iconLeading={Calendar}
                                            className="w-full justify-start"
                                        >
                                            Schedule Meeting
                                        </Button>
                                        <Button
                                            color="secondary"
                                            size="md"
                                            iconLeading={Settings01}
                                            className="w-full justify-start"
                                        >
                                            System Settings
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Tabs.Panel>

                        <Tabs.Panel id="analytics" className="mt-6">
                            <div className="rounded-lg border border-border-secondary bg-bg-primary p-8 text-center shadow-xs">
                                <BarChart01 className="mx-auto size-12 text-fg-tertiary" />
                                <h3 className="mt-4 text-lg font-semibold text-fg-primary">Analytics Dashboard</h3>
                                <p className="mt-2 text-fg-tertiary">Advanced analytics and insights will be displayed here.</p>
                                <Button color="primary" size="md" className="mt-4">
                                    Configure Analytics
                                </Button>
                            </div>
                        </Tabs.Panel>

                        <Tabs.Panel id="reports" className="mt-6">
                            <div className="rounded-lg border border-border-secondary bg-bg-primary p-8 text-center shadow-xs">
                                <Calendar className="mx-auto size-12 text-fg-tertiary" />
                                <h3 className="mt-4 text-lg font-semibold text-fg-primary">Reports Center</h3>
                                <p className="mt-2 text-fg-tertiary">Generate and download detailed reports about your business performance.</p>
                                <Button color="primary" size="md" className="mt-4">
                                    Create Report
                                </Button>
                            </div>
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};