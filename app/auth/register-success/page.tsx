import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle } from "lucide-react"

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen construction-bg flex items-center justify-center p-4">
      <div className="construction-overlay absolute inset-0" />
      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/logo-construloc.png"
                alt="ConstruLoc"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-construction-dark">Conta Criada com Sucesso!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Verifique seu email para confirmar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Enviamos um email de confirmação para o endereço fornecido. Clique no link do email para ativar sua conta
              e fazer login no sistema.
            </p>
            <div className="pt-4">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/">Voltar para Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
