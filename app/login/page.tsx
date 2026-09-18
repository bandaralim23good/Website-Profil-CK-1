"use client";

// import { FormEvent, useState } from "react";
import { FormEvent, Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

export default function LoginForm() {
    const searchParams = useSearchParams();

    const callbackUrl = searchParams.get("callbackUrl") || "/apps";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl,
        });

        setLoading(false);

        if (result?.error) {
            setError("Email atau password yang kamu masukkan salah.");
            return;
        }

        window.location.href = callbackUrl;
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-950">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* =====================================================
            LEFT SIDE
        ====================================================== */}
                <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
                    {/* Decorative */}
                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-700/20 blur-3xl" />
                    <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

                    <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700">
                                <span className="text-sm font-bold text-white">CK</span>
                            </div>

                            <div>
                                <p className="text-sm font-bold tracking-tight text-white">
                                    CK-1 Digital System
                                </p>

                                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                                    Central Kitchen 1
                                </p>
                            </div>
                        </div>

                        {/* Introduction */}
                        <div className="max-w-xl">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-400">
                                Application Portal
                            </p>

                            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                                One Portal.
                                <br />
                                <span className="text-teal-400">
                                    Multiple Applications.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-400 xl:text-base">
                                Akses berbagai sistem digital yang dikembangkan untuk
                                mendukung proses operasional dan pengelolaan data Central
                                Kitchen 1 dalam satu platform.
                            </p>
                        </div>

                        {/* Footer */}
                        <p className="text-xs text-slate-600">
                            CK-1 Digital System • Central Kitchen 1
                        </p>
                    </div>
                </section>

                {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
                <section className="flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="mb-10 flex items-center gap-3 lg:hidden">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700">
                                <span className="text-sm font-bold text-white">CK</span>
                            </div>

                            <div>
                                <p className="text-sm font-bold tracking-tight text-slate-950">
                                    CK-1 Digital System
                                </p>

                                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                                    Central Kitchen 1
                                </p>
                            </div>
                        </div>

                        {/* Login Header */}
                        <div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                <LockKeyhole className="h-5 w-5" />
                            </div>

                            <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
                                Welcome Back
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Login untuk mengakses Application Portal CK-1.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@company.com"
                                    autoComplete="email"
                                    required
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    autoComplete="current-password"
                                    required
                                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    "Signing in..."
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Info */}
                        <div className="mt-8 border-t border-slate-200 pt-6">
                            <p className="text-center text-xs leading-5 text-slate-400">
                                Gunakan akun yang telah terdaftar untuk mengakses aplikasi
                                digital CK-1.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-slate-50">
                    <p className="text-sm text-slate-500">Loading...</p>
                </main>
            }
        >
            <LoginForm />
        </Suspense>
    );
}