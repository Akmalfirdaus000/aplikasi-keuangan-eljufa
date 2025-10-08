"use client"

import Checkbox from "@/Components/Checkbox"
import InputError from "@/Components/InputError"
import InputLabel from "@/Components/InputLabel"
import PrimaryButton from "@/Components/PrimaryButton"
import TextInput from "@/Components/TextInput"
import { Head, Link, useForm } from "@inertiajs/react"
import { useState } from "react"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  })

  const [showPassword, setShowPassword] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    post(route("login"), {
      onFinish: () => reset("password"),
    })
  }

  // Ganti ini ke path gambar kamu
  const bgImage = "/bg-login2.jpg"

  return (
    <>
      <Head title="Masuk" />
      <div
        className="relative min-h-screen w-full overflow-hidden bg-gray-100"
        style={{
          // background image
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/30" />

        {/* Brand di kiri atas */}
        <div className="absolute top-5 left-5 z-10 hidden sm:flex items-center gap-3 text-white/90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
            <span className="text-lg font-bold">AK</span>
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold">Aplikasi Keuangan</div>
            <div className="text-xs text-white/70">Yayasan El-jufa</div>
          </div>
        </div>

        {/* Grid utama: kartu login di kanan pada desktop, center di mobile */}
        <div className="relative z-10 grid min-h-screen grid-cols-1 items-center justify-items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8">
            {/* Header kartu */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Masuk</h1>
                <p className="text-sm text-gray-500">Silakan login ke akun Anda</p>
              </div>
            </div>

            {/* Status dari server */}
            {status && (
              <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                {status}
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} className="space-y-4">
              {/* Email */}
              <div>
                <InputLabel htmlFor="email" value="Email" />
                <TextInput
                  id="email"
                  type="email"
                  name="email"
                  value={data.email}
                  className="mt-1 block w-full"
                  autoComplete="username"
                  isFocused={true}
                  onChange={(e) => setData("email", e.target.value)}
                  placeholder="nama@contoh.com"
                />
                <InputError message={errors.email} className="mt-2" />
              </div>

              {/* Password + toggle show/hide */}
              <div>
                <InputLabel htmlFor="password" value="Password" />
                <div className="relative mt-1">
                  <TextInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={data.password}
                    className="block w-full pr-10"
                    autoComplete="current-password"
                    onChange={(e) => setData("password", e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center text-gray-400 hover:text-gray-900"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <InputError message={errors.password} className="mt-2" />
              </div>

              {/* Remember + Forgot */}
              <div className="mt-1 flex items-center justify-between gap-4">
                <label className="inline-flex cursor-pointer items-center gap-2 select-none">
                  <Checkbox
                    name="remember"
                    checked={data.remember}
                    onChange={(e) => setData("remember", e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">Ingat saya</span>
                </label>

                {canResetPassword && (
                  <Link
                    href={route("password.request")}
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-700"
                  >
                    Lupa password?
                  </Link>
                )}
              </div>

              {/* Tombol submit */}
              <div className="pt-2">
                <PrimaryButton className="w-full justify-center bg-emerald-700" disabled={processing}>
                  {processing ? "Memproses..." : "Masuk"}
                </PrimaryButton>
              </div>
            </form>

            {/* Footer kecil */}
            <p className="mt-6 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} Aplikasi Keuangan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
