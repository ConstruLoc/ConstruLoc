import { NextResponse } from "next/server"
import { generateMonthlyPayments } from "@/lib/actions/monthly-payments"

export async function POST(request: Request) {
  try {
    const { contratoId, dataInicio, dataFim, valorTotal } = await request.json()

    const result = await generateMonthlyPayments(contratoId, dataInicio, dataFim, valorTotal)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in generate-monthly-payments API:", error)
    return NextResponse.json({ error: "Erro ao gerar pagamentos mensais" }, { status: 500 })
  }
}
