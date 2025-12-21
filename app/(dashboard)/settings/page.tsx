"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, User, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
                <p className="text-muted-foreground mt-1">
                    Kelola preferensi dan pengaturan akunmu
                </p>
            </div>

            {/* Settings Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <CardTitle>Profil</CardTitle>
                        </div>
                        <CardDescription>
                            Update informasi profil dan akun
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Nama</p>
                                <p className="font-medium">User</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">user@bonku.app</p>
                            </div>
                            <Button className="w-full" variant="outline">
                                Edit Profil
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <CardTitle>Notifikasi</CardTitle>
                        </div>
                        <CardDescription>
                            Atur preferensi notifikasi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">AI Insights</span>
                                <input type="checkbox" defaultChecked className="rounded" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Spending Alerts</span>
                                <input type="checkbox" defaultChecked className="rounded" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Education Reminders</span>
                                <input type="checkbox" className="rounded" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5" />
                            <CardTitle>Tampilan</CardTitle>
                        </div>
                        <CardDescription>
                            Customize appearance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Theme</p>
                                <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                                    <option>Light</option>
                                    <option>Dark</option>
                                    <option>System</option>
                                </select>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Currency</p>
                                <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                                    <option>IDR (Rp)</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5" />
                            <CardTitle>Lainnya</CardTitle>
                        </div>
                        <CardDescription>
                            Additional settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                Export Data
                            </Button>
                            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                                Logout
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
