import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, RefreshCw } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "access_denied":
        return "Acesso negado. Verifique suas credenciais."
      case "server_error":
        return "Erro no servidor. Tente novamente em alguns minutos."
      case "temporarily_unavailable":
        return "Serviço temporariamente indisponível."
      default:
        return "Ocorreu um erro não especificado durante a autenticação."
    }
  }

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
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-construction-dark">Erro de Autenticação</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {params?.error ? getErrorMessage(params.error) : getErrorMessage("")}
            </p>
            {params?.error && <p className="text-xs text-muted-foreground/70">Código do erro: {params.error}</p>}
            <div className="pt-4 space-y-2">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/login">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/">Voltar ao Início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
