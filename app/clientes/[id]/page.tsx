import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft, Building, User, Mail, Phone, MapPin, Hash, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "novo") {
    redirect("/clientes/novo")
  }

  const supabase = await createClient()

  // Fetch client details
  const { data: client, error } = await supabase.from("clientes").select("*").eq("id", id).single()

  if (error || !client) {
    notFound()
  }

  const formatDocument = (document: string, type: string) => {
    if (!document) return "-"

    if (type === "CPF") {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else {
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
  }

  const formatPhone = (phone: string) => {
    if (!phone) return "-"
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")
  }

  const formatCEP = (cep: string) => {
    if (!cep) return "-"
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2")
  }

  return (
    <MainLayout title="Detalhes do Cliente" showBackButton>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white">
            <Link href="/clientes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
            <Link href={`/clientes/${client.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600/10 rounded-lg">
                {client.tipo_documento === "CPF" ? (
                  <User className="h-6 w-6 text-orange-600" />
                ) : (
                  <Building className="h-6 w-6 text-orange-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{client.nome}</h2>
                <p className="text-sm text-slate-400">{client.empresa || "Cliente Individual"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-600/10 border border-orange-600/20 rounded-md">
              {client.tipo_documento === "CPF" ? (
                <User className="h-4 w-4 text-orange-600" />
              ) : (
                <Building className="h-4 w-4 text-orange-600" />
              )}
              <span className="text-sm font-medium text-orange-600">{client.tipo_documento}</span>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-1 w-8 bg-orange-600 rounded-full" />
              <h3 className="text-lg font-semibold text-white">Informações Pessoais</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  <Mail className="h-4 w-4 text-orange-600" />
                  Email
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-md px-4 py-3">
                  <p className="text-white">{client.email || "-"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  <Phone className="h-4 w-4 text-orange-600" />
                  Telefone
                  <span className="text-orange-600">*</span>
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-md px-4 py-3">
                  <p className="text-white">{formatPhone(client.telefone)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  <Hash className="h-4 w-4 text-orange-600" />
                  {client.tipo_documento}
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-md px-4 py-3">
                  <p className="text-white font-mono">{formatDocument(client.documento, client.tipo_documento)}</p>
                </div>
              </div>

              {client.empresa && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    <Building className="h-4 w-4 text-slate-400" />
                    Empresa
                  </label>
                  <div className="bg-slate-900 border border-slate-700 rounded-md px-4 py-3">
                    <p className="text-white">{client.empresa}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <div className="h-1 w-8 bg-orange-600 rounded-full" />
              <h3 className="text-lg font-semibold text-white">Endereço</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  CEP
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-md px-4 py-3">
                  <p className="text-white font-mono">{formatCEP(client.cep)}</p>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  Endereço Completo
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-md px-4 py-3">
                  <p className="text-white">{client.endereco || "-"}</p>
                </div>
              </div>

              {client.numero && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                    <Hash className="h-4 w-4 text-slate-400" />
                    Número
                  </label>
                  <div className="bg-slate-900 border border-slate-700 rounded-md px-4 py-3">
                    <p className="text-white">{client.numero}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information Section */}
          {client.observacoes && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <div className="h-1 w-8 bg-orange-600 rounded-full" />
                <h3 className="text-lg font-semibold text-white">Informações Adicionais</h3>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wide">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  Observações
                </label>
                <div className="bg-slate-900 border border-slate-700 rounded-md px-4 py-3">
                  <p className="text-white">{client.observacoes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-orange-600 rounded-full"></span>
              Cliente cadastrado em {new Date(client.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
