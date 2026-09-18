import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Factory,
  MapPin,
  ShieldCheck,
  Users,
  Utensils,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white">
              <Image
                src="/images/ppa.png"
                alt="Gacoan"
                fill
                className="object-contain"
              />
            </div>

            <div className="border-l border-slate-200 pl-3">
              <p className="text-sm font-bold tracking-tight text-slate-900">
                CK-1
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Central Kitchen
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#profile"
              className="transition hover:text-slate-900"
            >
              Profil
            </a>

            <a
              href="#gacoan"
              className="transition hover:text-slate-900"
            >
              Gacoan
            </a>

            <a
              href="#gallery"
              className="transition hover:text-slate-900"
            >
              Galeri
            </a>

            <a
              href="#activity"
              className="transition hover:text-slate-900"
            >
              Operasional
            </a>

            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
            >
              Aplikasi
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-slate-50 pt-28">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">

          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">

            {/* Hero Text */}
            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                <span className="h-2 w-2 rounded-full bg-teal-600" />
                Central Kitchen 1
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Pusat Produksi
                <br />
                <span className="text-slate-500">
                  CK-1
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Central Kitchen 1 merupakan fasilitas produksi yang
                mendukung kebutuhan operasional dan penyediaan produk
                secara terstruktur, konsisten, dan terkontrol.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">

                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 rounded-lg bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Akses Aplikasi

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <a
                  href="#profile"
                  className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Mengenal CK-1
                </a>

              </div>

              <div className="mt-10 flex items-center gap-2 text-sm text-slate-500">
                <MapPin size={16} />
                Central Kitchen 1
              </div>
              <div className=" flex items-center text-sm ">
                Jl. Peltu Sujono No.9, Ciptomulyo, Sukun, Kota Malang.
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">

              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-200 shadow-2xl shadow-slate-200/60">

                <Image
                  src="/images/CK-1.png"
                  alt="Central Kitchen 1"
                  fill
                  priority
                  className="object-cover"
                />

              </div>

              {/* Small Information Card */}
              <div className="absolute -bottom-6 left-6 hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:block">
                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
                    <Factory
                      size={21}
                      className="text-slate-700"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Facility
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      Central Kitchen 1
                    </p>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          PROFILE CK-1
      ========================================================= */}
      <section id="profile" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">

          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                Company Profile
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Mengenal
                <br />
                Central Kitchen 1
              </h2>

              <div className="mt-6 h-1 w-12 rounded-full bg-teal-600" />
            </div>

            <div className="space-y-6 text-[15px] leading-8 text-slate-600">

              <p>
                Central Kitchen 1 atau CK-1 merupakan salah satu fasilitas
                yang mendukung proses produksi dan pengolahan produk
                untuk kebutuhan operasional perusahaan.
              </p>

              <p>
                Kegiatan di CK-1 dilakukan melalui proses yang terstruktur
                dengan memperhatikan standar operasional, kualitas,
                keamanan, efisiensi, serta konsistensi hasil produksi.
              </p>

              <p>
                Dengan dukungan sumber daya manusia, fasilitas produksi,
                dan sistem kerja yang terintegrasi, CK-1 berperan dalam
                memastikan kebutuhan produksi dapat berjalan secara
                optimal.
              </p>

            </div>
          </div>


          {/* Quick Stats */}
          <div className="mt-20 grid overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:grid-cols-3">

            <Stat
              value="CK-1"
              label="Central Kitchen"
            />

            <Stat
              value="Production"
              label="Operational Focus"
            />

            <Stat
              value="Quality"
              label="Primary Commitment"
            />

          </div>

        </div>
      </section>


      {/* =========================================================
          PARENT COMPANY — GACOAN
      ========================================================= */}
      <section id="gacoan" className="border-y border-slate-200 bg-slate-50">

        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* Logo */}
            <div className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <Image
                src="/images/produk.png"
                alt="Bakso dan Mie Gacoan"
                fill
                className="object-contain"
              />
            </div>


            {/* Content */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                Brand Supported
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Bakso dan Mie Gacoan
              </h2>

              <div className="mt-6 h-1 w-12 rounded-full bg-teal-600" />

              <p className="mt-7 leading-8 text-slate-600">
                Central Kitchen 1 memproduksi dan menyiapkan berbagai kebutuhan
                produk untuk mendukung operasional brand
                <span className="font-semibold text-slate-900">
                  {" "}Bakso dan Mie Gacoan
                </span>.
              </p>

              <p className="mt-5 leading-8 text-slate-600">
                Melalui proses produksi yang terstandarisasi, CK-1 mendukung
                ketersediaan produk dengan memperhatikan kualitas, konsistensi,
                dan kebutuhan operasional setiap outlet.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          GALLERY
      ========================================================= */}
      <section id="gallery" className="bg-white">

        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                Documentation
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Aktivitas & Fasilitas CK-1
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-500">
              Dokumentasi fasilitas, aktivitas produksi, dan lingkungan
              kerja Central Kitchen 1.
            </p>

          </div>


          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <GalleryImage
              src="/images/ck1-1.jpg"
              alt="Fasilitas CK-1"
              className="md:row-span-2 md:h-full"
            />

            <GalleryImage
              src="/images/ck1-2.jpg"
              alt="Aktivitas CK-1"
            />

            <GalleryImage
              src="/images/ck1-3.jpg"
              alt="Area produksi CK-1"
            />

            <GalleryImage
              src="/images/ck1-4.jpg"
              alt="Aktivitas produksi CK-1"
            />

            <GalleryImage
              src="/images/ck1-5.jpg"
              alt="Tim CK-1"
            />

          </div>

        </div>
      </section>


      {/* =========================================================
          OPERATIONAL FOCUS
      ========================================================= */}
      <section id="activity" className="bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">

          <div className="max-w-2xl">

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-400">
              Operational Focus
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Fokus Operasional CK-1
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Setiap aktivitas diarahkan untuk mendukung proses produksi
              yang efektif, konsisten, dan sesuai dengan standar yang
              telah ditetapkan.
            </p>

          </div>


          <div className="mt-12 grid gap-5 md:grid-cols-3">

            <DarkInfoCard
              icon={<Factory size={22} />}
              title="Production"
              description="Mendukung proses produksi dan pengolahan sesuai kebutuhan operasional."
            />

            <DarkInfoCard
              icon={<ShieldCheck size={22} />}
              title="Quality"
              description="Menjaga kualitas dan konsistensi produk melalui proses kerja yang terkontrol."
            />

            <DarkInfoCard
              icon={<Users size={22} />}
              title="People"
              description="Didukung oleh sumber daya manusia yang bekerja secara kolaboratif dan terarah."
            />

          </div>

        </div>
      </section>


      {/* =========================================================
          APPLICATION CTA
      ========================================================= */}
      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-12 lg:p-16">

            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                  Internal Application
                </p>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Sistem Digital CK-1
                </h2>

                <p className="mt-5 max-w-2xl leading-7 text-slate-600">
                  Akses berbagai aplikasi yang digunakan untuk membantu
                  aktivitas dan kebutuhan operasional CK-1.
                </p>

              </div>

              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-3 rounded-lg bg-slate-900 px-7 py-4 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Lihat Aplikasi

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="font-bold text-slate-900">
              CK-1
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Central Kitchen
            </p>
          </div>

          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} CK-1. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="border-b border-slate-200 p-7 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}


function GalleryImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-64 overflow-hidden rounded-2xl bg-slate-100 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition duration-500 hover:scale-105"
      />
    </div>
  );
}


function DarkInfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-slate-700 hover:bg-slate-800">

      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-teal-400">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {description}
      </p>

    </div>
  );
}