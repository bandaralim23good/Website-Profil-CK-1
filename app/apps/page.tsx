"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  ClipboardCheck,
  Factory,
  Package,
  Search,
  ShoppingCart,
  Users,
  Warehouse,
} from "lucide-react";

type Application = {
  name: string;
  description: string;
  category: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
};

const applications: Application[] = [
  {
    name: "Premix Calculator",
    description:
      "Kalkulasi kebutuhan bahan baku dan packaging untuk proses produksi Premix Sachet",
    category: "Production",
    href: "https://premix-sachet.vercel.app/",
    icon: Calculator,
    active: true,
  },
  //   {
  //     name: "Production Management",
  //     description:
  //       "Pengelolaan dan monitoring aktivitas produksi Central Kitchen 1.",
  //     category: "Production",
  //     href: "/production",
  //     icon: Factory,
  //     active: true,
  //   },
  {
    name: "Bakso Production Dashboard",
    description:
      "Platfrom Monitoring Hasil Produksi Bakso di CK-1",
    category: "Dashboard",
    href: "https://production-ck-1.vercel.app/",
    icon: BarChart3,
    active: true,
  },
  {
    name: "Laporan QHS",
    description:
      "Monitoring Laporan Bulanan dari Divisi QHS",
    category: "Warehouse",
    href: "https://laporan-direktorat.vercel.app/",
    icon: Warehouse,
    active: true,
  },
  {
    name: "Labour Direct Management",
    description:
      "Pelaporan dan pengelolaan data tenaga kerja secara langsung.",
    category: "Quality",
    href: "#",
    icon: ClipboardCheck,
    active: false,
  },
  {
    name: "Manufacturing Scoring",
    description:
      "Monitoring dan pengelolaan nilai manufacturing pada Operasional Central Kitchen 1.",
    category: "Manufacturing",
    href: "/manufacturing-scoring",
    icon: Factory,
    active: true,
  },
  //   {
  //     name: "Purchasing",
  //     description:
  //       "Pengelolaan kebutuhan pembelian dan proses procurement.",
  //     category: "Procurement",
  //     href: "#",
  //     icon: ShoppingCart,
  //     active: false,
  //   },
  //   {
  //     name: "Material Management",
  //     description:
  //       "Pengelolaan data material dan kebutuhan produksi.",
  //     category: "Warehouse",
  //     href: "#",
  //     icon: Package,
  //     active: false,
  //   },
  //   {
  //     name: "HR & Workforce",
  //     description:
  //       "Informasi dan pengelolaan data tenaga kerja Central Kitchen 1.",
  //     category: "Human Resources",
  //     href: "#",
  //     icon: Users,
  //     active: false,
  //   },
];

export default function AppsPage() {
  const [search, setSearch] = useState("");
  // const applications: Application[] = [
  const filteredApplications = applications.filter((app) => {
    const keyword = search.toLowerCase();

    return (
      app.name.toLowerCase().includes(keyword) ||
      app.description.toLowerCase().includes(keyword) ||
      app.category.toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700">
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

            {/* Button ke halaman awal */}
            <Link
              href="/"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              ← Halaman Utama
            </Link>

          </div>
        </div>
      </header>

      {/* =====================================================
          HERO / DIGITALIZATION INTRODUCTION
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-teal-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-5 lg:px-8 lg:py-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-700">
              Digital Transformation
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Digitalisasi
              <br />
              <span className="text-teal-700">
                Central Kitchen 1
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Membangun proses kerja yang lebih terintegrasi, terukur, dan
              efisien melalui pemanfaatan teknologi digital untuk mendukung
              aktivitas operasional Central Kitchen 1.
            </p>

            <a
              href="#applications"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Explore Applications
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Small information blocks */}
          <div className="mt-8 grid max-w-3xl gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
            <div className="bg-white p-5">
              <p className="text-2xl font-bold text-slate-950">
                {applications.length}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Digital Applications
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-2xl font-bold text-slate-950">
                Production
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Operational Focus
              </p>
            </div>

            <div className="bg-white p-5">
              <p className="text-2xl font-bold text-slate-950">
                Integrated
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Digital Ecosystem
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          APPLICATION SECTION
      ====================================================== */}
      <section
        id="applications"
        className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20"
      >
        {/* Section introduction */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
            Application Portal
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Temukan Aplikasi
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Akses berbagai aplikasi digital yang tersedia untuk mendukung
            aktivitas Central Kitchen 1.
          </p>
        </div>

        {/* =================================================
            SEARCH
        ================================================== */}
        <div className="mx-auto mt-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aplikasi..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </div>
        </div>

        {/* =================================================
            APPLICATION LIST
        ================================================== */}
        <div className="mt-16">
          <div className="flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Available Systems
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-950">
                Applications
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              {filteredApplications.length} aplikasi
            </p>
          </div>

          {/* Cards */}
          {filteredApplications.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...filteredApplications]
                .sort((a, b) => Number(b.active) - Number(a.active))
                .map((app) => {
                  const Icon = app.icon;

                  return (
                    <div
                      key={app.name}
                      className="group flex min-h-[330px] flex-col rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-200/60"
                    >
                      {/* Logo / Icon */}
                      <div className="flex items-start justify-between">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-100">
                          <Icon
                            className="h-8 w-8"
                            strokeWidth={1.7}
                          />
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${app.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-400"
                            }`}
                        >
                          {app.active ? "Active" : "Coming Soon"}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="mt-7 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">
                          {app.category}
                        </p>

                        <h4 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                          {app.name}
                        </h4>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {app.description}
                        </p>
                      </div>

                      {/* Button */}
                      <div className="mt-7">
                        {app.active ? (
                          <a
                            href={app.href}
                            className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-slate-800 transition group-hover:text-teal-700"
                          >
                            <span>Buka Aplikasi</span>

                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </a>
                        ) : (
                          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-slate-400">
                            <span>Segera Hadir</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
              <Search className="mx-auto h-6 w-6 text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Aplikasi tidak ditemukan
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Coba gunakan kata kunci yang berbeda.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <p className="text-center text-xs text-slate-400">
            CK-1 Digital System • Central Kitchen 1
          </p>
        </div>
      </footer>
    </main>
  );
}
