"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    BarChart3,
    Building2,
    Check,
    ChevronDown,
    Edit,
    LogOut,
    Package,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
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
    const [deleteTarget, setDeleteTarget] = useState<{
        type: "factory" | "sku" | "score";
        id: number;
        name: string;
        description: string;
    } | null>(null);
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showMasterData, setShowMasterData] = useState(true);
    const [selectedFactoryId, setSelectedFactoryId] = useState<number | null>(
        null
    );
    const [showChart, setShowChart] = useState(false);
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
    const allPeriods = useMemo(() => {
        const periods = filteredScores.map((item) => ({
            year: item.year,
            month: item.month,
        }));

        const uniquePeriods = Array.from(
            new Map(
                periods.map((period) => [
                    `${period.year}-${period.month}`,
                    period,
                ])
            ).values()
        );

        return uniquePeriods.sort((a, b) => {
            if (a.year !== b.year) {
                return a.year - b.year;
            }

            return a.month - b.month;
        });
    }, [filteredScores]);
    const products = useMemo(() => {
        const skuMap = new Map<number, SKU>();

        filteredScores.forEach((score) => {
            score.skuScores.forEach((skuScore) => {
                skuMap.set(skuScore.sku.id, skuScore.sku);
            });
        });

        return Array.from(skuMap.values()).sort((a, b) =>
            a.code.localeCompare(b.code)
        );
    }, [filteredScores]);
    const periodsByYear = useMemo(() => {
        return allPeriods.reduce<Record<number, typeof allPeriods>>(
            (result, period) => {
                if (!result[period.year]) {
                    result[period.year] = [];
                }

                result[period.year].push(period);

                return result;
            },
            {}
        );
    }, [allPeriods]);
    // ============================================================
    // CHART DATA
    // ============================================================
    const chartData = useMemo(() => {
        return allPeriods.map((period) => {
            const score = filteredScores.find(
                (item) =>
                    item.year === period.year &&
                    item.month === period.month
            );

            const row: Record<string, string | number> = {
                period: `${months[period.month - 1]} ${period.year}`,
            };

            products.forEach((product) => {
                const skuScore = score?.skuScores.find(
                    (item) => item.skuId === product.id
                );

                row[`sku_${product.id}`] = skuScore?.score ?? 0;
            });

            row.overall = score?.score ?? 0;

            return row;
        });
    }, [allPeriods, filteredScores, products]);

    const chartSkuLines = useMemo(() => {
        return products.map((product) => ({
            key: `sku_${product.id}`,
            name: product.name,
        }));
    }, [products]);
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
            setSuccessMessage(
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

    function deleteFactory(factory: Factory) {
        setDeleteTarget({
            type: "factory",
            id: factory.id,
            name: factory.name,
            description:
                "Semua SKU dan scoring yang terkait dengan factory ini juga akan dihapus.",
        });
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

            setSuccessMessage(
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

    function deleteSKU(sku: SKU) {
        setDeleteTarget({
            type: "sku",
            id: sku.id,
            name: sku.name,
            description: "SKU ini akan dihapus beserta semua data terkait.",
        });
    }

    // ============================================================
    // SCORE MODAL
    // ============================================================

    function openCreateScore() {
        setEditingScore(null);

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        setScoreFactoryId("");
        setScoreMonth(currentMonth);
        setScoreYear(currentYear);
        setOverallScore("");
        setSkuScores([]);

        setModal("score");
    }
    function loadExistingScore(
        factoryId: number,
        month: number,
        year: number
    ) {
        const factory = factories.find(
            (item) => item.id === factoryId
        );

        if (!factory) {
            setOverallScore("");
            setSkuScores([]);
            return;
        }

        const existingScore = scores.find(
            (item) =>
                item.factoryId === factoryId &&
                item.month === month &&
                item.year === year
        );

        // Belum ada scoring untuk periode tersebut
        if (!existingScore) {
            setOverallScore("");

            setSkuScores(
                factory.skus.map((sku) => ({
                    skuId: sku.id,
                    score: "",
                }))
            );

            return;
        }

        // Sudah ada scoring → tampilkan nilai lama
        setOverallScore(String(existingScore.score));

        setSkuScores(
            factory.skus.map((sku) => {
                const existingSKUScore =
                    existingScore.skuScores.find(
                        (item) => item.skuId === sku.id
                    );

                return {
                    skuId: sku.id,
                    score: existingSKUScore
                        ? String(existingSKUScore.score)
                        : "",
                };
            })
        );
    }

    function openEditScore(score: ManufacturingScore) {
        setEditingScore(score);

        setScoreFactoryId(score.factoryId);
        setScoreMonth(score.month);
        setScoreYear(score.year);
        setOverallScore(String(score.score));

        const factory = factories.find(
            (item) => item.id === score.factoryId
        );

        if (!factory) {
            setSkuScores([]);
            setModal("score");
            return;
        }

        setSkuScores(
            factory.skus.map((sku) => {
                const existingSKUScore = score.skuScores.find(
                    (item) => item.skuId === sku.id
                );

                return {
                    skuId: sku.id,
                    score: existingSKUScore
                        ? String(existingSKUScore.score)
                        : "",
                };
            })
        );

        setModal("score");
    }

    function handleScoreFactoryChange(value: string) {
        const factoryId = Number(value);

        setScoreFactoryId(factoryId);

        if (!factoryId) {
            setOverallScore("");
            setSkuScores([]);
            return;
        }

        loadExistingScore(
            factoryId,
            scoreMonth,
            scoreYear
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
                    skuScores: skuScores
                        .filter((item) => item.score.trim() !== "")
                        .map((item) => ({
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

            setSuccessMessage(
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

    function deleteScore(score: ManufacturingScore) {
        setDeleteTarget({
            type: "score",
            id: score.id,
            name: `${score.factory.name} - ${months[score.month - 1]
                } ${score.year}`,
            description:
                "Data scoring factory beserta scoring SKU yang terkait akan dihapus.",
        });
    }
    async function confirmDelete() {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            setMessage("");
            setError("");

            let endpoint = "";

            if (deleteTarget.type === "factory") {
                endpoint = `/api/factories/${deleteTarget.id}`;
            } else if (deleteTarget.type === "sku") {
                endpoint = `/api/skus/${deleteTarget.id}`;
            } else {
                endpoint = `/api/manufacturing-scoring/${deleteTarget.id}`;
            }

            const response = await fetch(endpoint, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            if (deleteTarget.type === "factory") {
                setSuccessMessage("Factory berhasil dihapus.");
            } else if (deleteTarget.type === "sku") {
                setSuccessMessage("SKU berhasil dihapus.");
            } else {
                setSuccessMessage("Scoring berhasil dihapus.");
            }

            setDeleteTarget(null);

            await loadData();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal menghapus data."
            );
        } finally {
            setDeleting(false);
        }
    }

    // ============================================================
    // DATA CLASIFICATION BY COLOR
    // ============================================================
    function getScoreColor(score: number) {
        if (score >= 90) {
            return "bg-blue-400 text-blue-1000";
        }

        if (score >= 72) {
            return "bg-green-400 text-green-1000";
        }

        if (score >= 60) {
            return "bg-yellow-300 text-yellow-1000";
        }

        if (score >= 40) {
            return "bg-orange-400 text-orange-1000";
        }
        if (score == 0) {
            return "bg-white-400 text-red-1000";
        }

        return "bg-red-400 text-red-1000";
    }

    const renderScoreLabel = (props: any) => {
        const { x, y, value } = props;

        return (
            <text
                x={x}
                y={y - 12}
                textAnchor="middle"
                fill="#0f172a"
                fontSize={11}
                fontWeight={600}
            >
                {typeof value === "number"
                    ? `${value.toFixed(2)}%`
                    : value}
            </text>
        );
    };
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
                        <div className="mb-5">
                            <button
                                type="button"
                                onClick={() => router.push("/apps")}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Aplikasi
                            </button>
                        </div>
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
                    <section className="mt-8">
                        {/* HEADER */}
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Master Data
                                </h2>

                                <p className="text-xs text-slate-400">
                                    Kelola Factory dan SKU
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowMasterData((prev) => !prev)
                                }
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                {showMasterData
                                    ? "Sembunyikan Data"
                                    : "Tampilkan Data"}
                            </button>
                        </div>

                        {showMasterData && (
                            <div className="grid gap-5 md:grid-cols-2">
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
                                            type="button"
                                            onClick={openCreateFactory}
                                            className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-teal-700"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add
                                        </button>
                                    </div>

                                    {/* FACTORY DROPDOWN */}
                                    <div className="mt-5">
                                        <select
                                            value={selectedFactoryId ?? ""}
                                            onChange={(e) =>
                                                setSelectedFactoryId(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-teal-500"
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
                                                    {selectedFactoryId
                                                        ? `${factories.find(
                                                            (factory) =>
                                                                factory.id ===
                                                                selectedFactoryId
                                                        )?.skus.length ?? 0
                                                        } SKU`
                                                        : "Pilih factory"}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={openCreateSKU}
                                            disabled={!selectedFactoryId}
                                            className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add
                                        </button>
                                    </div>

                                    {/* SKU DARI FACTORY TERPILIH */}
                                    <div className="mt-5 max-h-64 space-y-2 overflow-y-auto">
                                        {!selectedFactoryId ? (
                                            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                                                <p className="text-sm font-medium text-slate-500">
                                                    Pilih factory terlebih dahulu
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    SKU akan ditampilkan berdasarkan
                                                    factory yang dipilih.
                                                </p>
                                            </div>
                                        ) : (
                                            (() => {
                                                const selectedFactory =
                                                    factories.find(
                                                        (factory) =>
                                                            factory.id ===
                                                            selectedFactoryId
                                                    );

                                                if (!selectedFactory) {
                                                    return null;
                                                }

                                                if (
                                                    selectedFactory.skus.length === 0
                                                ) {
                                                    return (
                                                        <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                                                            <p className="text-sm font-medium text-slate-500">
                                                                Belum ada SKU
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                Factory ini belum memiliki
                                                                SKU.
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                return selectedFactory.skus.map(
                                                    (sku) => (
                                                        <div
                                                            key={sku.id}
                                                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-semibold">
                                                                    {sku.code}
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {sku.name}
                                                                </p>
                                                            </div>

                                                            <div className="flex gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEditSKU(
                                                                            sku
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-teal-700"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        deleteSKU(
                                                                            sku
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                );
                                            })()
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* SCORE TABLE */}
                <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div>
                            <h2 className="font-bold">
                                Manufacturing Score
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                {filteredScores.length} data ditemukan
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowChart((prev) => !prev)}
                            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-700"
                        >
                            {showChart ? "Sembunyikan Chart" : "Tampilkan Chart"}
                        </button>
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
                        <div className="space-y-4 overflow-x-auto">

                            {/* ========================= */}
                            {/* TABLE 2 - OVERALL SCORE */}
                            {/* ========================= */}

                            <div>
                                <h3 className="mb-2 text-xs font-bold text-slate-700">
                                    Overall Score
                                </h3>

                                <table className="w-max border-collapse text-center text-xs">
                                    <thead>
                                        <tr>
                                            <th
                                                rowSpan={3}
                                                className="sticky left-0 z-30 w-28 min-w-28 max-w-28 border border-slate-300 bg-slate-100 px-2 py-1 text-[10px] font-bold"
                                            >
                                                CHECKLIST
                                            </th>

                                            {Object.entries(periodsByYear).map(
                                                ([year, periods]) => (
                                                    <th
                                                        key={year}
                                                        colSpan={periods.length}
                                                        className="border border-slate-300 bg-red-600 px-2 py-1 text-xs font-bold text-white"
                                                    >
                                                        CK - 1
                                                    </th>
                                                )
                                            )}
                                        </tr>

                                        <tr>
                                            {Object.entries(periodsByYear).map(
                                                ([year, periods]) => (
                                                    <th
                                                        key={year}
                                                        colSpan={periods.length}
                                                        className="border border-slate-300 bg-red-100 px-2 py-1 text-[10px] font-bold"
                                                    >
                                                        {year}
                                                    </th>
                                                )
                                            )}
                                        </tr>

                                        <tr>
                                            {allPeriods.map((period) => (
                                                <th
                                                    key={`${period.year}-${period.month}`}
                                                    className="w-20 min-w-20 max-w-20 border border-slate-300 bg-slate-50 px-1 py-1 text-[10px] font-semibold"
                                                >
                                                    {months[period.month - 1]}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td className="sticky left-0 z-20 w-28 min-w-28 max-w-28 border border-slate-300 bg-slate-100 px-2 py-1.5 text-left text-[10px] font-bold">
                                                OVERALL SCORE
                                            </td>

                                            {allPeriods.map((period) => {
                                                const score = filteredScores.find(
                                                    (item) =>
                                                        item.month === period.month &&
                                                        item.year === period.year
                                                );

                                                return (
                                                    <td
                                                        key={`overall-${period.year}-${period.month}`}
                                                        className={`w-20 min-w-20 max-w-20 border border-slate-300 px-1 py-1.5 text-[10px] font-bold ${score
                                                            ? getScoreColor(score.score)
                                                            : "bg-white"
                                                            }`}
                                                    >
                                                        {score
                                                            ? `${score.score.toFixed(2)}%`
                                                            : "-"}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {showChart && (
                                <div className="mt-6 space-y-6">

                                    {/* ========================================= */}
                                    {/* CHART OVERALL SCORE */}
                                    {/* ========================================= */}

                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                                        <div className="mb-5">
                                            <h3 className="text-base font-bold text-slate-900">
                                                Trend Overall Score
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Perkembangan nilai overall score CK-1 berdasarkan
                                                periode
                                            </p>
                                        </div>

                                        <div className="h-[330px] w-full">

                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <LineChart
                                                    data={chartData}
                                                    margin={{
                                                        top: 10,
                                                        right: 30,
                                                        left: 10,
                                                        bottom: 10,
                                                    }}
                                                >

                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke="#e2e8f0"
                                                    />

                                                    <XAxis
                                                        dataKey="period"
                                                        padding={{
                                                            left: 30,
                                                            right: 30,
                                                        }}
                                                        tick={{
                                                            fontSize: 11,
                                                            fill: "#64748b",
                                                        }}
                                                        tickLine={false}
                                                        axisLine={{
                                                            stroke: "#cbd5e1",
                                                        }}
                                                    />

                                                    <YAxis
                                                        domain={[0, 105]}
                                                        tick={{
                                                            fontSize: 11,
                                                            fill: "#64748b",
                                                        }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(value) =>
                                                            `${value}%`
                                                        }
                                                    />

                                                    <Tooltip
                                                        contentStyle={{
                                                            borderRadius: "12px",
                                                            border: "1px solid #e2e8f0",
                                                            boxShadow:
                                                                "0 10px 25px rgba(15, 23, 42, 0.08)",
                                                            fontSize: "12px",
                                                        }}
                                                        labelStyle={{
                                                            fontWeight: 700,
                                                            marginBottom: 6,
                                                            color: "#0f172a",
                                                        }}
                                                        formatter={(value) => [
                                                            typeof value === "number"
                                                                ? `${value.toFixed(2)}%`
                                                                : value,
                                                            "Overall Score",
                                                        ]}
                                                    />

                                                    <Line
                                                        type="linear"
                                                        dataKey="overall"
                                                        name="Overall Score"
                                                        stroke="#2563eb"
                                                        strokeWidth={3}
                                                        dot={{
                                                            r: 5,
                                                            fill: "#ffffff",
                                                            strokeWidth: 3,
                                                            stroke: "#2563eb",
                                                        }}
                                                        activeDot={{
                                                            r: 7,
                                                            strokeWidth: 2,
                                                        }}
                                                        label={renderScoreLabel}
                                                    />

                                                </LineChart>
                                            </ResponsiveContainer>

                                        </div>
                                    </div>

                                </div>
                            )}
                            {/* ========================= */}
                            {/* TABLE 1 - MANUFACTURING SCORE */}
                            {/* ========================= */}

                            <div>
                                <h3 className="mb-2 text-xs font-bold text-slate-700">
                                    Manufacturing Score
                                </h3>

                                <table className="w-max border-collapse text-center text-xs">
                                    <thead>
                                        <tr>
                                            <th
                                                rowSpan={3}
                                                className="sticky left-0 z-30 w-28 min-w-28 max-w-28 border border-slate-300 bg-slate-100 px-2 py-1 text-[10px] font-bold"
                                            >
                                                CHECKLIST
                                            </th>

                                            {Object.entries(periodsByYear).map(
                                                ([year, periods]) => (
                                                    <th
                                                        key={year}
                                                        colSpan={periods.length}
                                                        className="border border-slate-300 bg-red-600 px-2 py-1 text-xs font-bold text-white"
                                                    >
                                                        CK - 1
                                                    </th>
                                                )
                                            )}
                                        </tr>

                                        <tr>
                                            {Object.entries(periodsByYear).map(
                                                ([year, periods]) => (
                                                    <th
                                                        key={year}
                                                        colSpan={periods.length}
                                                        className="border border-slate-300 bg-red-100 px-2 py-1 text-[10px] font-bold"
                                                    >
                                                        {year}
                                                    </th>
                                                )
                                            )}
                                        </tr>

                                        <tr>
                                            {allPeriods.map((period) => (
                                                <th
                                                    key={`${period.year}-${period.month}`}
                                                    className="w-20 min-w-20 max-w-20 border border-slate-300 bg-slate-50 px-1 py-1 text-[10px] font-semibold"
                                                >
                                                    {months[period.month - 1]}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id}>
                                                <td className="sticky left-0 z-20 w-28 min-w-28 max-w-28 border border-slate-300 bg-white px-2 py-1.5 text-left text-[10px] font-semibold">
                                                    {product.name}
                                                </td>

                                                {allPeriods.map((period) => {
                                                    const score = filteredScores.find(
                                                        (item) =>
                                                            item.month === period.month &&
                                                            item.year === period.year
                                                    );

                                                    const skuScore =
                                                        score?.skuScores.find(
                                                            (item) =>
                                                                item.skuId === product.id
                                                        );

                                                    return (
                                                        <td
                                                            key={`${product.id}-${period.year}-${period.month}`}
                                                            className={`w-20 min-w-20 max-w-20 border border-slate-300 px-1 py-1.5 text-[10px] font-semibold ${skuScore
                                                                ? getScoreColor(skuScore.score)
                                                                : "bg-white"
                                                                }`}
                                                        >
                                                            {skuScore
                                                                ? `${skuScore.score.toFixed(2)}%`
                                                                : "-"}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* {showChart && (
                                <div className="mt-6 space-y-6">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                                        <div className="mb-5">
                                            <h3 className="text-base font-bold text-slate-900">
                                                Trend Manufacturing Score
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Perkembangan score setiap produk berdasarkan bulan
                                            </p>
                                        </div>

                                        <div className="h-[380px] w-full">

                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <LineChart
                                                    data={chartData}
                                                    margin={{
                                                        top: 35,
                                                        right: 40,
                                                        left: 15,
                                                        bottom: 30,
                                                    }}
                                                >

                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        stroke="#e2e8f0"
                                                    />

                                                    <XAxis
                                                        dataKey="period"
                                                        padding={{
                                                            left: 30,
                                                            right: 30,
                                                        }}
                                                        tick={{
                                                            fontSize: 11,
                                                            fill: "#64748b",
                                                        }}
                                                        tickLine={false}
                                                        axisLine={{
                                                            stroke: "#cbd5e1",
                                                        }}
                                                    />

                                                    <YAxis
                                                        domain={[0, 110]}
                                                        tick={{
                                                            fontSize: 11,
                                                            fill: "#64748b",
                                                        }}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(value) =>
                                                            `${value}%`
                                                        }
                                                    />

                                                    <Tooltip
                                                        contentStyle={{
                                                            borderRadius: "12px",
                                                            border: "1px solid #e2e8f0",
                                                            boxShadow:
                                                                "0 10px 25px rgba(15, 23, 42, 0.08)",
                                                            fontSize: "12px",
                                                        }}
                                                        labelStyle={{
                                                            fontWeight: 700,
                                                            marginBottom: 6,
                                                            color: "#0f172a",
                                                        }}
                                                        formatter={(value, name) => [
                                                            typeof value === "number"
                                                                ? `${value.toFixed(2)}%`
                                                                : value,
                                                            name,
                                                        ]}
                                                    />

                                                    <Legend
                                                        verticalAlign="bottom"
                                                        height={50}
                                                        iconType="line"
                                                        wrapperStyle={{
                                                            fontSize: "11px",
                                                            paddingTop: "15px",
                                                        }}
                                                    />

                                                    {chartSkuLines.map((line, index) => {

                                                        const colors = [
                                                            "#2563eb",
                                                            "#dc2626",
                                                            "#16a34a",
                                                            "#9333ea",
                                                            "#ea580c",
                                                            "#0891b2",
                                                            "#db2777",
                                                            "#65a30d",
                                                        ];

                                                        return (
                                                            <Line
                                                                key={line.key}
                                                                type="linear"
                                                                dataKey={line.key}
                                                                name={line.name}
                                                                stroke={colors[index % colors.length]}
                                                                strokeWidth={2.5}
                                                                dot={{
                                                                    r: 4,
                                                                    strokeWidth: 2,
                                                                    fill: "#ffffff",
                                                                }}
                                                                activeDot={{
                                                                    r: 6,
                                                                    strokeWidth: 2,
                                                                }}
                                                                label={{
                                                                    position: "top",
                                                                    fontSize: 10,
                                                                    fontWeight: 600,
                                                                    formatter: (value) =>
                                                                        typeof value === "number"
                                                                            ? `${value.toFixed(2)}%`
                                                                            : value,
                                                                }}
                                                                connectNulls
                                                            />
                                                        );
                                                    })}

                                                </LineChart>
                                            </ResponsiveContainer>

                                        </div>
                                    </div>
                                </div>
                            )} */}

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
                                        onChange={(e) => {
                                            const month = Number(e.target.value);

                                            setScoreMonth(month);

                                            if (!editingScore && scoreFactoryId) {
                                                loadExistingScore(
                                                    scoreFactoryId,
                                                    month,
                                                    scoreYear
                                                );
                                            }
                                        }
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
                                        onChange={(e) => {
                                            const year = Number(e.target.value);

                                            setScoreYear(year);

                                            if (!editingScore && scoreFactoryId) {
                                                loadExistingScore(
                                                    scoreFactoryId,
                                                    scoreMonth,
                                                    year
                                                );
                                            }
                                        }}
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
            )
            }
            {
                deleteTarget && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                        onClick={() => {
                            if (!deleting) {
                                setDeleteTarget(null);
                            }
                        }}
                    >
                        <div
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <Trash2 className="h-6 w-6" />
                            </div>

                            {/* Content */}
                            <div className="mt-5">
                                <h3 className="text-lg font-bold text-slate-900">
                                    Hapus{" "}
                                    {deleteTarget.type === "factory"
                                        ? "Factory"
                                        : deleteTarget.type === "sku"
                                            ? "SKU"
                                            : "Scoring"}?
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Apakah kamu yakin ingin menghapus{" "}
                                    <span className="font-semibold text-slate-800">
                                        "{deleteTarget.name}"
                                    </span>
                                    ?
                                </p>

                                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                                    <p className="text-xs leading-5 text-red-600">
                                        {deleteTarget.description}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={confirmDelete}
                                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {deleting ? "Menghapus..." : "Ya, Hapus"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                successMessage && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                        onClick={() => setSuccessMessage(null)}
                    >
                        <div
                            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                <Check className="h-7 w-7" />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-slate-900">
                                Berhasil
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {successMessage}
                            </p>

                            <button
                                type="button"
                                onClick={() => setSuccessMessage(null)}
                                className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )
            }

        </main >
    );
}