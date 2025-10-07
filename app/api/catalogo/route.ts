import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Listar todos os produtos do catálogo
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const categoria = searchParams.get("categoria")
    const disponivel = searchParams.get("disponivel")
    const destaque = searchParams.get("destaque")

    let query = supabase.from("produtos_catalogo").select("*").order("created_at", { ascending: false })

    // Filtros opcionais
    if (categoria) {
      query = query.eq("categoria", categoria)
    }
    if (disponivel !== null) {
      query = query.eq("disponivel", disponivel === "true")
    }
    if (destaque !== null) {
      query = query.eq("destaque", destaque === "true")
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Erro ao buscar produtos:", error)
      return NextResponse.json({ error: "Erro ao buscar produtos do catálogo" }, { status: 500 })
    }

    return NextResponse.json({ produtos: data }, { status: 200 })
  } catch (error) {
    console.error("[v0] Erro no GET /api/catalogo:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST - Adicionar novo produto ao catálogo
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    let userId = null
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id || null
      console.log("[v0] User ID:", userId)
    } catch (authError) {
      console.log("[v0] Nenhum usuário autenticado, continuando sem user_id")
    }

    const { nome, descricao, categoria, preco_normal, preco_diario, imagem_url } = body

    const produtoData = {
      nome: nome || null,
      descricao: descricao || null,
      categoria: categoria || null,
      preco_normal: preco_normal ? Number.parseFloat(preco_normal) : null,
      preco_diario: preco_diario ? Number.parseFloat(preco_diario) : null,
      imagem_url: imagem_url || null,
      especificacoes: body.especificacoes || [],
      disponivel: body.disponivel !== undefined ? body.disponivel : true,
      destaque: body.destaque !== undefined ? body.destaque : false,
      user_id: userId, // Pode ser null se não houver usuário autenticado
    }

    console.log("[v0] Inserindo produto no catálogo:", produtoData)

    const { data, error } = await supabase.from("produtos_catalogo").insert([produtoData]).select().single()

    if (error) {
      console.error("[v0] Erro ao inserir produto:", error.message)
      return NextResponse.json({ error: error.message || "Erro ao adicionar produto ao catálogo" }, { status: 500 })
    }

    console.log("[v0] Produto adicionado com sucesso:", data)

    return NextResponse.json({ message: "Produto adicionado com sucesso", produto: data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Erro no POST /api/catalogo:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// PUT - Atualizar produto existente
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 })
    }

    const { data, error } = await supabase.from("produtos_catalogo").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Erro ao atualizar produto:", error)
      return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
    }

    return NextResponse.json({ message: "Produto atualizado com sucesso", produto: data }, { status: 200 })
  } catch (error) {
    console.error("[v0] Erro no PUT /api/catalogo:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// DELETE - Remover produto do catálogo
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 })
    }

    const { error } = await supabase.from("produtos_catalogo").delete().eq("id", id)

    if (error) {
      console.error("[v0] Erro ao deletar produto:", error)
      return NextResponse.json({ error: "Erro ao remover produto" }, { status: 500 })
    }

    return NextResponse.json({ message: "Produto removido com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Erro no DELETE /api/catalogo:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
