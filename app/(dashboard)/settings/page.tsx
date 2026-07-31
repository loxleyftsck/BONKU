"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, User, Palette, Shield } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { ErrorState } from "@/components/shared/ErrorState";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";

export default function SettingsPage() {
    const { data: profile, isLoading, isError, refetch } = useProfile();
    const updateProfile = useUpdateProfile();
    const { theme, setTheme } = useTheme();

    // Null means "untouched", so the field follows the loaded profile without
    // an effect mirroring server state into local state.
    const [draftName, setDraftName] = useState<string | null>(null);
    const [status, setStatus] = useState("");

    const name = draftName ?? profile?.name ?? "";

    const saveName = async () => {
        setStatus("");
        try {
            await updateProfile.mutateAsync({ name });
            setDraftName(null);
            setStatus("Nama tersimpan.");
        } catch (err) {
            setStatus(err instanceof Error ? err.message : "Gagal menyimpan.");
        }
    };

    const toggleSetting = (
        key: "notifications_enabled" | "hide_balances",
        value: boolean
    ) => {
        updateProfile.mutate({ settings: { [key]: value } });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
                <p className="text-muted-foreground mt-1">
                    Kelola preferensi dan pengaturan akunmu
                </p>
            </div>

            {isLoading ? (
                <p className="text-muted-foreground">Memuat pengaturan...</p>
            ) : isError ? (
                <ErrorState subject="pengaturan" onRetry={() => refetch()} />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Profile */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" aria-hidden="true" />
                                <CardTitle>Profil</CardTitle>
                            </div>
                            <CardDescription>Informasi akunmu</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="profile-name">Nama</Label>
                                    <Input
                                        id="profile-name"
                                        value={name}
                                        onChange={(e) => setDraftName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="profile-email">Email</Label>
                                    <Input
                                        id="profile-email"
                                        value={profile?.email ?? ""}
                                        readOnly
                                        disabled
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Email tidak bisa diubah dari sini.
                                    </p>
                                </div>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={saveName}
                                    disabled={
                                        updateProfile.isPending ||
                                        name.trim().length < 2 ||
                                        name === profile?.name
                                    }
                                >
                                    {updateProfile.isPending ? "Menyimpan..." : "Simpan Nama"}
                                </Button>
                                {status && (
                                    <p role="status" className="text-sm text-muted-foreground">
                                        {status}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5" aria-hidden="true" />
                                <CardTitle>Privasi</CardTitle>
                            </div>
                            <CardDescription>
                                Kendalikan apa yang terlihat di layarmu
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="hide-balances" className="font-normal">
                                        Sembunyikan nominal
                                        <span className="block text-xs text-muted-foreground">
                                            Berguna saat memakai perangkat bersama
                                        </span>
                                    </Label>
                                    <input
                                        type="checkbox"
                                        id="hide-balances"
                                        className="rounded border-input"
                                        checked={profile?.settings?.hide_balances ?? false}
                                        onChange={(e) =>
                                            toggleSetting("hide_balances", e.target.checked)
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <Label htmlFor="notifications" className="font-normal">
                                        Notifikasi
                                    </Label>
                                    <input
                                        type="checkbox"
                                        id="notifications"
                                        className="rounded border-input"
                                        checked={profile?.settings?.notifications_enabled ?? false}
                                        onChange={(e) =>
                                            toggleSetting("notifications_enabled", e.target.checked)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Palette className="h-5 w-5" aria-hidden="true" />
                                <CardTitle>Tampilan</CardTitle>
                            </div>
                            <CardDescription>Tema aplikasi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="theme">Tema</Label>
                                <select
                                    id="theme"
                                    className="w-full rounded-md border border-input bg-background px-3 min-h-11"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value as Theme)}
                                >
                                    <option value="light">Terang</option>
                                    <option value="dark">Gelap</option>
                                    <option value="system">Ikuti sistem</option>
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Mata uang saat ini tetap Rupiah (IDR).
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Other */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" aria-hidden="true" />
                                <CardTitle>Lainnya</CardTitle>
                            </div>
                            <CardDescription>Akun dan dokumen</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Link href="/legal/privacy" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        Kebijakan Privasi
                                    </Button>
                                </Link>
                                <Link href="/legal/terms" className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        Syarat &amp; Ketentuan
                                    </Button>
                                </Link>
                                <LogoutButton />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
