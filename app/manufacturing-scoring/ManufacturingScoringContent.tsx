"use client";

import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    Building2,
    ChevronDown,
    Edit,
    LogOut,
    Package,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";
import { signOut } from "next-auth/react";

type User = {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
};

type SKU = {
    id: number;
    factoryId: number;
    code: string;
    name: string;
};

type Factory = {
    id: number;
    code: string;
    name: string;
    skus: SKU[];
};

type SKUScore = {
    id: number;
    skuId: number;
    score: number;
    sku: SKU;
};

type ManufacturingScore = {
    id: number;
    factoryId: number;
    month: number;
    year: number;
    score: number;
    factory: Factory;
    skuScores: SKUScore[];
};

type Props = {
    user: User;
};

const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

export default function ManufacturingScoringContent({
    user,
}: Props) {
    const isAdmin = user.role === "ADMIN";

    const [factories, setFactories] = useState<Factory[]>([]);
    const [scores, setScores] = useState<ManufacturingScore[]>([]);

    const [selectedFactory, setSelectedFactory] = useState<number | "all">(
        "all"
    );

    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    );

    const [selectedMonth, setSelectedMonth] = useState<number | "all">(
        "all"
    );

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ============================================================
    // MODAL
    // ============================================================

    const [modal, setModal] = useState<
        "factory" | "sku" | "score" | null
    >(null);

    const [editingFactory, setEditingFactory] =
        useState<Factory | null>(null);

    const [editingSKU, setEditingSKU] = useState<SKU | null>(null);

    const [editingScore, setEditingScore] =
        useState<ManufacturingScore | null>(null);

    // ============================================================
    // FORM FACTORY
    // ============================================================

    const [factoryCode, setFactoryCode] = useState("");
    const [factoryName, setFactoryName] = useState("");

    // ============================================================
    // FORM SKU
    // ============================================================

    const [skuFactoryId, setSkuFactoryId] = useState<number | "">("");
    const [skuCode, setSkuCode] = useState("");
    const [skuName, setSkuName] = useState("");

    // ============================================================
    // FORM SCORE
    // ============================================================

    const [scoreFactoryId, setScoreFactoryId] = useState<number | "">("");
    const [scoreMonth, setScoreMonth] = useState(
        new Date().getMonth() + 1
    );
    const [scoreYear, setScoreYear] = useState(
        new Date().getFullYear()
    );
    const [overallScore, setOverallScore] = useState("");

    const [skuScores, setSkuScores] = useState<
        { skuId: number; score: string }[]
    >([]);

    // ============================================================
    // LOAD DATA
    // ============================================================

    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const [factoryResponse, scoreResponse] = await Promise.all([
                fetch("/api/factories"),
                fetch("/api/manufacturing-scoring"),
            ]);

            if (!factoryResponse.ok || !scoreResponse.ok) {
                throw new Error("Gagal mengambil data.");
            }

            const factoryData = await factoryResponse.json();
            const scoreData = await scoreResponse.json();

            setFactories(factoryData);
            setScores(scoreData);
        } catch (err) {
            console.error(err);
            setError("Gagal mengambil data manufacturing scoring.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    // ============================================================
    // FILTER
    // ============================================================

    const filteredScores = useMemo(() => {
        return scores.filter((item) => {
            const factoryMatch =
                selectedFactory === "all" ||
                item.factoryId === selectedFactory;

            const yearMatch = item.year === selectedYear;

            const monthMatch =
                selectedMonth === "all" ||
                item.month === selectedMonth;

            return factoryMatch && yearMatch && monthMatch;
        });
    }, [
        scores,
        selectedFactory,
        selectedYear,
        selectedMonth,
    ]);

    // ============================================================
    // FACTORY MODAL
    // ============================================================

    function openCreateFactory() {
        setEditingFactory(null);
        setFactoryCode("");
        setFactoryName("");
        setModal("factory");
    }

    function openEditFactory(factory: Factory) {
        setEditingFactory(factory);
        setFactoryCode(factory.code);
        setFactoryName(factory.name);
        setModal("factory");
    }

    function closeModal() {
        setModal(null);
        setEditingFactory(null);
        setEditingSKU(null);
        setEditingScore(null);
    }

    async function saveFactory() {
        try {
            setMessage("");
            setError("");

            const url = editingFactory
                ? `/api/factories/${editingFactory.id}`
                : "/api/factories";

            const response = await fetch(url, {
                method: editingFactory ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: factoryCode,
                    name: factoryName,
                }),
            });

            const data = await response.json();

            console.log("FACTORY RESPONSE:", {
                status: response.status,
                data,
            });

            if (!response.ok) {
                throw new Error(
                    data.message || `Gagal menyimpan factory. (${response.status})`
                );
            }
            setMessage(
                editingFactory
                    ? "Factory berhasil diperbarui."
                    : "Factory berhasil ditambahkan."
            );

            closeModal();
            await loadData();
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal menyimpan factory."
            );
        }
    }

    async function deleteFactory(factory: Factory) {
        const confirmed = window.confirm(
            `Hapus factory "${factory.name}"?\n\nSemua SKU dan scoring yang terkait juga akan terhapus.`
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `/api/factories/${factory.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setMessage("Factory berhasil dihapus.");
            await loadData();
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal menghapus factory."
            );
        }
    }

    // ============================================================
    // SKU MODAL
    // ============================================================

    function openCreateSKU() {
        setEditingSKU(null);
        setSkuFactoryId("");
        setSkuCode("");
        setSkuName("");
        setModal("sku");
    }

    function openEditSKU(sku: SKU) {
        setEditingSKU(sku);
        setSkuFactoryId(sku.factoryId);
        setSkuCode(sku.code);
        setSkuName(sku.name);
        setModal("sku");
    }

    async function saveSKU() {
        try {
            setMessage("");
            setError("");

            const url = editingSKU
                ? `/api/skus/${editingSKU.id}`
                : "/api/skus";

            const response = await fetch(url, {
                method: editingSKU ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    factoryId: skuFactoryId,
                    code: skuCode,
                    name: skuName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Gagal menyimpan SKU.");
            }

            setMessage(
                editingSKU
                    ? "SKU berhasil diperbarui."
                    : "SKU berhasil ditambahkan."
            );

            closeModal();
            await loadData();
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal menyimpan SKU."
            );
        }
    }

    async function deleteSKU(sku: SKU) {
        const confirmed = window.confirm(
            `Hapus SKU "${sku.name}"?`
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/skus/${sku.id}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setMessage("SKU berhasil dihapus.");
            await loadData();
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal menghapus SKU."
            );
        }
    }

    // ============================================================
    // SCORE MODAL
    // ============================================================

    function openCreateScore() {
        setEditingScore(null);
        setScoreFactoryId("");
        setScoreMonth(new Date().getMonth() + 1);
        setScoreYear(new Date().getFullYear());
        setOverallScore("");
        setSkuScores([]);
        setModal("score");
    }

    function openEditScore(score: ManufacturingScore) {
        setEditingScore(score);

        setScoreFactoryId(score.factoryId);
        setScoreMonth(score.month);
        setScoreYear(score.year);
        setOverallScore(String(score.score));

        setSkuScores(
            score.skuScores.map((item) => ({
                skuId: item.skuId,
                score: String(item.score),
            }))
        );

        setModal("score");
    }

    function handleScoreFactoryChange(value: string) {
        const factoryId = Number(value);

        setScoreFactoryId(factoryId);

        const factory = factories.find(
            (item) => item.id === factoryId
        );

        if (!factory) {
            setSkuScores([]);
            return;
        }

        setSkuScores(
            factory.skus.map((sku) => ({
                skuId: sku.id,
                score: "",
            }))
        );
    }

    function updateSKUScore(
        skuId: number,
        value: string
    ) {
        setSkuScores((current) =>
            current.map((item) =>
                item.skuId === skuId
                    ? {
                        ...item,
                        score: value,
                    }
                    : item
            )
        );
    }

    async function saveScore() {
        try {
            setMessage("");
            setError("");

            const url = editingScore
                ? `/api/manufacturing-scoring/${editingScore.id}`
                : "/api/manufacturing-scoring";

            const response = await fetch(url, {
                method: editingScore ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    factoryId: scoreFactoryId,
                    month: scoreMonth,
                    year: scoreYear,
                    score: Number(overallScore),
                    skuScores: skuScores.map((item) => ({
                        skuId: item.skuId,
                        score: Number(item.score),
                    })),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Gagal menyimpan scoring."
                );
            }

            setMessage(
                editingScore
                    ? "Scoring berhasil diperbarui."
                    : "Scoring berhasil ditambahkan."
            );

            closeModal();
            await loadData();
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal menyimpan scoring."
            );
        }
    }

    async function deleteScore(score: ManufacturingScore) {
        const confirmed = window.confirm(
            `Hapus scoring ${score.factory.name} - ${months[score.month - 1]
            } ${score.year}?`
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `/api/manufacturing-scoring/${score.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setMessage("Scoring berhasil dihapus.");
            await loadData();
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal menghapus scoring."
            );
        }
    }

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <main className="min-h-screen bg-slate-50 text-slate-950">
            {/* HEADER */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>

                        <div>
                            <p className="text-sm font-bold">
                                Manufacturing Scoring
                            </p>

                            <p className="text-xs text-slate-400">
                                CK-1 Digital System
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold">
                                {user.name}
                            </p>

                            <p className="text-xs uppercase text-slate-400">
                                {user.role}
                            </p>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                Logout
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                {/* TITLE */}
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                            Manufacturing
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight">
                            Scoring Dashboard
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-slate-500">
                            Monitoring dan pengelolaan nilai manufacturing
                            berdasarkan factory dan SKU.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={openCreateScore}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add Scoring
                        </button>
                    )}
                </div>

                {/* MESSAGE */}
                {message && (
                    <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* FILTER */}
                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Factory */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                                Factory
                            </label>

                            <div className="relative">
                                <select
                                    value={selectedFactory}
                                    onChange={(e) =>
                                        setSelectedFactory(
                                            e.target.value === "all"
                                                ? "all"
                                                : Number(e.target.value)
                                        )
                                    }
                                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm outline-none focus:border-teal-500"
                                >
                                    <option value="all">
                                        Semua Factory
                                    </option>

                                    {factories.map((factory) => (
                                        <option
                                            key={factory.id}
                                            value={factory.id}
                                        >
                                            {factory.code} - {factory.name}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        {/* Month */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                                Month
                            </label>

                            <select
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(
                                        e.target.value === "all"
                                            ? "all"
                                            : Number(e.target.value)
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-teal-500"
                            >
                                <option value="all">Semua Bulan</option>

                                {months.map((month, index) => (
                                    <option
                                        key={month}
                                        value={index + 1}
                                    >
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year */}
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                                Year
                            </label>

                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(Number(e.target.value))
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-teal-500"
                            >
                                {[2024, 2025, 2026, 2027].map(
                                    (year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>
                </section>

                {/* FACTORY + SKU MANAGEMENT */}
                {isAdmin && (
                    <section className="mt-8 grid gap-5 md:grid-cols-2">
                        {/* FACTORY */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                        <Building2 className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="font-bold">
                                            Factory
                                        </h2>

                                        <p className="text-xs text-slate-400">
                                            {factories.length} factory
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={openCreateFactory}
                                    className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-teal-700"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add
                                </button>
                            </div>

                            <div className="mt-5 space-y-2">
                                {factories.map((factory) => (
                                    <div
                                        key={factory.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {factory.code}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {factory.name}
                                            </p>
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() =>
                                                    openEditFactory(factory)
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-teal-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    deleteFactory(factory)
                                                }
                                                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SKU */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                        <Package className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="font-bold">
                                            SKU
                                        </h2>

                                        <p className="text-xs text-slate-400">
                                            {factories.reduce(
                                                (total, factory) =>
                                                    total + factory.skus.length,
                                                0
                                            )}{" "}
                                            SKU
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={openCreateSKU}
                                    className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-teal-700"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add
                                </button>
                            </div>

                            <div className="mt-5 max-h-64 space-y-2 overflow-y-auto">
                                {factories.flatMap((factory) =>
                                    factory.skus.map((sku) => (
                                        <div
                                            key={sku.id}
                                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {sku.code}
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    {sku.name} • {factory.code}
                                                </p>
                                            </div>

                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() =>
                                                        openEditSKU(sku)
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-teal-700"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteSKU(sku)
                                                    }
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* SCORE TABLE */}
                <section className="mt-8 rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div>
                            <h2 className="font-bold">
                                Manufacturing Score
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                {filteredScores.length} data ditemukan
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-sm text-slate-400">
                            Loading data...
                        </div>
                    ) : filteredScores.length === 0 ? (
                        <div className="p-10 text-center">
                            <BarChart3 className="mx-auto h-8 w-8 text-slate-300" />

                            <p className="mt-3 text-sm font-semibold text-slate-600">
                                Belum ada data scoring
                            </p>

                            {isAdmin && (
                                <p className="mt-1 text-xs text-slate-400">
                                    Klik Add Scoring untuk menambahkan data.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Factory
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Period
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Overall Score
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                                            SKU
                                        </th>

                                        {isAdmin && (
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Action
                                            </th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredScores.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-slate-50 last:border-0"
                                        >
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold">
                                                    {item.factory.code}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {item.factory.name}
                                                </p>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-600">
                                                {months[item.month - 1]}{" "}
                                                {item.year}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="text-lg font-bold text-teal-700">
                                                    {item.score}%
                                                </span>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    {item.skuScores.map(
                                                        (skuScore) => (
                                                            <div
                                                                key={skuScore.id}
                                                                className="flex min-w-[220px] items-center justify-between gap-5 text-sm"
                                                            >
                                                                <span className="text-slate-600">
                                                                    {skuScore.sku.code}
                                                                </span>

                                                                <span className="font-semibold">
                                                                    {skuScore.score}%
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </td>

                                            {isAdmin && (
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-1">
                                                        <button
                                                            onClick={() =>
                                                                openEditScore(item)
                                                            }
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-teal-50 hover:text-teal-700"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                deleteScore(item)
                                                            }
                                                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            {/* ========================================================
          FACTORY MODAL
      ========================================================= */}
            {modal === "factory" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold">
                                    {editingFactory
                                        ? "Edit Factory"
                                        : "Add Factory"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Masukkan informasi factory.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <input
                                value={factoryCode}
                                onChange={(e) =>
                                    setFactoryCode(e.target.value)
                                }
                                placeholder="Factory Code"
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-teal-500"
                            />

                            <input
                                value={factoryName}
                                onChange={(e) =>
                                    setFactoryName(e.target.value)
                                }
                                placeholder="Factory Name"
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-teal-500"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                            >
                                Batal
                            </button>

                            <button
                                onClick={saveFactory}
                                className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                            >
                                <Save className="h-4 w-4" />
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
          SKU MODAL
      ========================================================= */}
            {modal === "sku" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold">
                                    {editingSKU ? "Edit SKU" : "Add SKU"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Masukkan informasi SKU.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <select
                                value={skuFactoryId}
                                onChange={(e) =>
                                    setSkuFactoryId(
                                        e.target.value
                                            ? Number(e.target.value)
                                            : ""
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-teal-500"
                            >
                                <option value="">Pilih Factory</option>

                                {factories.map((factory) => (
                                    <option
                                        key={factory.id}
                                        value={factory.id}
                                    >
                                        {factory.code} - {factory.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                value={skuCode}
                                onChange={(e) =>
                                    setSkuCode(e.target.value)
                                }
                                placeholder="SKU Code"
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-teal-500"
                            />

                            <input
                                value={skuName}
                                onChange={(e) =>
                                    setSkuName(e.target.value)
                                }
                                placeholder="SKU Name"
                                className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-teal-500"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                            >
                                Batal
                            </button>

                            <button
                                onClick={saveSKU}
                                className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                            >
                                <Save className="h-4 w-4" />
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
          SCORE MODAL
      ========================================================= */}
            {modal === "score" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold">
                                    {editingScore
                                        ? "Edit Manufacturing Score"
                                        : "Add Manufacturing Score"}
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Masukkan score factory dan masing-masing SKU.
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            {/* Factory */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-500">
                                    Factory
                                </label>

                                <select
                                    value={scoreFactoryId}
                                    onChange={(e) =>
                                        handleScoreFactoryChange(
                                            e.target.value
                                        )
                                    }
                                    disabled={!!editingScore}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-teal-500 disabled:bg-slate-100"
                                >
                                    <option value="">
                                        Pilih Factory
                                    </option>

                                    {factories.map((factory) => (
                                        <option
                                            key={factory.id}
                                            value={factory.id}
                                        >
                                            {factory.code} - {factory.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Period */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                                        Month
                                    </label>

                                    <select
                                        value={scoreMonth}
                                        onChange={(e) =>
                                            setScoreMonth(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-teal-500"
                                    >
                                        {months.map((month, index) => (
                                            <option
                                                key={month}
                                                value={index + 1}
                                            >
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold text-slate-500">
                                        Year
                                    </label>

                                    <input
                                        type="number"
                                        value={scoreYear}
                                        onChange={(e) =>
                                            setScoreYear(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            {/* Overall */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-500">
                                    Overall Factory Score (%)
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={overallScore}
                                    onChange={(e) =>
                                        setOverallScore(e.target.value)
                                    }
                                    placeholder="Contoh: 89.5"
                                    className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-teal-500"
                                />
                            </div>

                            {/* SKU Scores */}
                            {scoreFactoryId && (
                                <div>
                                    <div className="mb-3">
                                        <p className="text-sm font-bold">
                                            SKU Score
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            Score masing-masing SKU.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {skuScores.map((item) => {
                                            const factory = factories.find(
                                                (factory) =>
                                                    factory.id === scoreFactoryId
                                            );

                                            const sku = factory?.skus.find(
                                                (sku) => sku.id === item.skuId
                                            );

                                            if (!sku) return null;

                                            return (
                                                <div
                                                    key={item.skuId}
                                                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold">
                                                            {sku.code}
                                                        </p>

                                                        <p className="truncate text-xs text-slate-400">
                                                            {sku.name}
                                                        </p>
                                                    </div>

                                                    <div className="relative w-28">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={item.score}
                                                            onChange={(e) =>
                                                                updateSKUScore(
                                                                    item.skuId,
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Score"
                                                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm outline-none focus:border-teal-500"
                                                        />

                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                                            %
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
                            >
                                Batal
                            </button>

                            <button
                                onClick={saveScore}
                                className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                            >
                                <Save className="h-4 w-4" />
                                Simpan Scoring
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}