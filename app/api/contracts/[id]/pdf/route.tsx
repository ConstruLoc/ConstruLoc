import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { renderToStream } from "@react-pdf/renderer"
import { ContractPDF } from "@/components/contracts/contract-pdf"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Fetch contract with all related data
    const { data: contract, error } = await supabase
      .from("contratos")
      .select(
        `
        *,
        clientes (*),
        itens_contrato (
          *,
          equipamentos (*)
        )
      `,
      )
      .eq("id", params.id)
      .single()

    if (error || !contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 })
    }

    // Generate PDF
    const stream = await renderToStream(<ContractPDF contract={contract} />)

    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-${contract.numero_contrato}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
