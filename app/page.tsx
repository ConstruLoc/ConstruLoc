import { LoginForm } from "@/components/auth/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center construction-bg">
      <div className="absolute inset-0 construction-overlay" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/logo-construloc-sem-fundo.png"
              alt="ConstruLoc Logo"
              width={200}
              height={200}
              className="object-contain"
            />
          </div>
        </div>

        <div className="backdrop-blur-sm bg-white/10 rounded-xl border border-white/20 p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
