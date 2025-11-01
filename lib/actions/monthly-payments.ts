"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function generateMonthlyPayments(
  contratoId: string,
  dataInicio: string,
  dataFim: string,
  valorTotal: number,
) {
  const supabase = await createClient()

  try {
    await supabase.from("pagamentos_mensais").delete().eq("contrato_id", contratoId)

    // Calculate months between start and end dates
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)

    const months = []
    const currentDate = new Date(inicio)

    // Calculate number of months
    let monthCount = 0
    while (currentDate <= fim) {
      monthCount++
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Each month should have the same value as valorTotal
    const valorMensal = valorTotal

    console.log("[v0] Generating monthly payments:", {
      contratoId,
      monthCount,
      valorMensal,
      totalContractValue: valorMensal * monthCount,
    })

    // Generate monthly payments
    currentDate.setTime(inicio.getTime())
    while (currentDate <= fim) {
      const mes = currentDate.getMonth() + 1
      const ano = currentDate.getFullYear()
      const mesNome = currentDate.toLocaleDateString("pt-BR", { month: "short" })
      const mesReferencia = `${mesNome}/${ano}`

      // Set due date to the same day of the month as start date
      const dataVencimento = new Date(currentDate)

      months.push({
        contrato_id: contratoId,
        mes,
        ano,
        mes_referencia: mesReferencia,
        valor: valorMensal,
        status: "pendente",
        data_vencimento: dataVencimento.toISOString().split("T")[0],
      })

      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Insert monthly payments
    const { error } = await supabase.from("pagamentos_mensais").insert(months)

    if (error) {
      console.error("[v0] Error generating monthly payments:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Monthly payments generated successfully:", months.length)

    await updateContractPaymentStatus(contratoId)

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in generateMonthlyPayments:", error)
    return { success: false, error: "Erro ao gerar pagamentos mensais" }
  }
}

async function updateContractPaymentStatus(contratoId: string) {
  const supabase = await createClient()

  try {
    // Get all monthly payments for this contract
    const { data: monthlyPayments, error: fetchError } = await supabase
      .from("pagamentos_mensais")
      .select("status")
      .eq("contrato_id", contratoId)

    if (fetchError || !monthlyPayments || monthlyPayments.length === 0) {
      console.error("[v0] Error fetching monthly payments for status update:", fetchError)
      return
    }

    // Calculate overall status
    const allPaid = monthlyPayments.every((p) => p.status === "pago")
    const anyPaid = monthlyPayments.some((p) => p.status === "pago")

    let overallStatus = "pendente"
    if (allPaid) {
      overallStatus = "pago"
    } else if (anyPaid && !allPaid) {
      overallStatus = "parcial"
    }

    // Get contract details
    const { data: contrato, error: contratoError } = await supabase
      .from("contratos")
      .select("numero_contrato, valor_total, clientes(nome, empresa), itens_contrato(equipamentos(nome))")
      .eq("id", contratoId)
      .single()

    if (contratoError || !contrato) {
      console.error("[v0] Error fetching contract details:", contratoError)
      return
    }

    const equipamentosInfo =
      (contrato as any).itens_contrato?.map((item: any) => ({
        nome: item.equipamentos?.nome || "Equipamento",
      })) || []

    const { data: existingPayment } = await supabase
      .from("pagamentos")
      .select("id")
      .eq("contrato_id", contratoId)
      .maybeSingle()

    const paymentData = {
      contrato_id: contratoId,
      contrato_numero: (contrato as any).numero_contrato || "",
      cliente_nome: (contrato as any).clientes?.nome || "",
      cliente_empresa: (contrato as any).clientes?.empresa || "",
      valor: (contrato as any).valor_total || 0,
      data_vencimento: new Date().toISOString().split("T")[0],
      data_pagamento: allPaid ? new Date().toISOString().split("T")[0] : null,
      status: overallStatus,
      equipamentos_info: equipamentosInfo,
      contrato_excluido: false,
      updated_at: new Date().toISOString(),
    }

    if (existingPayment) {
      const { error: updateError } = await supabase.from("pagamentos").update(paymentData).eq("id", existingPayment.id)

      if (updateError) {
        console.error("[v0] Error updating payment record:", updateError.message)
      }
    } else {
      const { error: insertError } = await supabase.from("pagamentos").insert(paymentData)

      if (insertError) {
        console.error("[v0] Error inserting payment record:", insertError.message)
      }
    }
  } catch (error) {
    console.error("[v0] Error updating contract payment status:", error)
  }
}

export async function markMonthAsPaid(paymentId: string) {
  const supabase = await createClient()

  try {
    console.log("[v0] markMonthAsPaid: Starting for payment ID:", paymentId)

    // Get the monthly payment details
    const { data: monthlyPayment, error: fetchError } = await supabase
      .from("pagamentos_mensais")
      .select("*")
      .eq("id", paymentId)
      .single()

    if (fetchError || !monthlyPayment) {
      console.error("[v0] Error fetching monthly payment:", fetchError)
      return { success: false, error: fetchError?.message || "Pagamento não encontrado" }
    }

    console.log("[v0] Monthly payment found:", monthlyPayment.mes_referencia)

    // Update monthly payment
    const { error: updateError } = await supabase
      .from("pagamentos_mensais")
      .update({
        status: "pago",
        data_pagamento: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)

    if (updateError) {
      console.error("[v0] Error marking payment as paid:", updateError)
      return { success: false, error: updateError.message }
    }

    console.log("[v0] Monthly payment updated successfully")

    console.log("[v0] Updating contract payment status...")
    await updateContractPaymentStatus(monthlyPayment.contrato_id)

    console.log("[v0] Revalidating paths...")
    revalidatePath("/contratos/[id]", "page")
    revalidatePath("/pagamentos", "page")
    revalidatePath("/relatorios", "page")
    revalidatePath("/dashboard", "page")
    revalidatePath("/contratos", "page")

    console.log("[v0] markMonthAsPaid: Completed successfully")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in markMonthAsPaid:", error)
    return { success: false, error: "Erro ao marcar pagamento como pago" }
  }
}

export async function updateMonthlyPaymentsStatus(contratoId: string) {
  const supabase = await createClient()

  try {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // Get all pending payments for this contract
    const { data: payments, error: fetchError } = await supabase
      .from("pagamentos_mensais")
      .select("*")
      .eq("contrato_id", contratoId)
      .eq("status", "pendente")

    if (fetchError) {
      console.error("[v0] Error fetching payments:", fetchError)
      return { success: false, error: fetchError.message }
    }

    if (!payments || payments.length === 0) {
      return { success: true }
    }

    // Update overdue payments
    const overduePayments = payments.filter((payment) => {
      const vencimento = new Date(payment.data_vencimento)
      vencimento.setHours(0, 0, 0, 0)
      return vencimento < hoje
    })

    if (overduePayments.length > 0) {
      const { error: updateError } = await supabase
        .from("pagamentos_mensais")
        .update({ status: "atrasado", updated_at: new Date().toISOString() })
        .in(
          "id",
          overduePayments.map((p) => p.id),
        )

      if (updateError) {
        console.error("[v0] Error updating overdue payments:", updateError)
        return { success: false, error: updateError.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in updateMonthlyPaymentsStatus:", error)
    return { success: false, error: "Erro ao atualizar status dos pagamentos" }
  }
}

export async function updateMonthlyPayment(
  paymentId: string,
  data: {
    valor?: number
    data_vencimento?: string
    data_pagamento?: string
    status?: string
  },
) {
  const supabase = await createClient()

  try {
    // Get the monthly payment details
    const { data: monthlyPayment, error: fetchError } = await supabase
      .from("pagamentos_mensais")
      .select("*")
      .eq("id", paymentId)
      .single()

    if (fetchError || !monthlyPayment) {
      return { success: false, error: "Pagamento não encontrado" }
    }

    // Update monthly payment
    const { error } = await supabase
      .from("pagamentos_mensais")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)

    if (error) {
      console.error("Error updating monthly payment:", error)
      return { success: false, error: error.message }
    }

    await updateContractPaymentStatus(monthlyPayment.contrato_id)

    revalidatePath("/contratos/[id]", "page")
    revalidatePath("/pagamentos", "page")
    revalidatePath("/relatorios", "page")
    revalidatePath("/contratos", "page")
    return { success: true }
  } catch (error) {
    console.error("Error in updateMonthlyPayment:", error)
    return { success: false, error: "Erro ao atualizar pagamento mensal" }
  }
}

export async function deleteMonthlyPayment(paymentId: string) {
  const supabase = await createClient()

  try {
    // Get the monthly payment details before deleting
    const { data: monthlyPayment, error: fetchError } = await supabase
      .from("pagamentos_mensais")
      .select("*")
      .eq("id", paymentId)
      .single()

    if (fetchError || !monthlyPayment) {
      return { success: false, error: "Pagamento não encontrado" }
    }

    // Delete from monthly payments
    const { error } = await supabase.from("pagamentos_mensais").delete().eq("id", paymentId)

    if (error) {
      console.error("Error deleting monthly payment:", error)
      return { success: false, error: error.message }
    }

    await updateContractPaymentStatus(monthlyPayment.contrato_id)

    revalidatePath("/contratos/[id]", "page")
    revalidatePath("/pagamentos", "page")
    revalidatePath("/relatorios", "page")
    revalidatePath("/contratos", "page")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteMonthlyPayment:", error)
    return { success: false, error: "Erro ao excluir pagamento mensal" }
  }
}

export async function recalculateMonthlyPayments(contratoId: string) {
  const supabase = await createClient()

  try {
    console.log("[v0] Recalculating monthly payments for contract:", contratoId)

    // Get contract details
    const { data: contract, error: contractError } = await supabase
      .from("contratos")
      .select("data_inicio, data_fim, valor_total")
      .eq("id", contratoId)
      .single()

    if (contractError || !contract) {
      console.error("[v0] Error fetching contract:", contractError)
      return { success: false, error: "Contrato não encontrado" }
    }

    // Calculate number of months
    const inicio = new Date(contract.data_inicio)
    const fim = new Date(contract.data_fim)
    const currentDate = new Date(inicio)
    let monthCount = 0
    while (currentDate <= fim) {
      monthCount++
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // The current valor_total is actually the monthly value
    const valorMensal = contract.valor_total
    const newValorTotal = valorMensal * monthCount

    console.log("[v0] Recalculation details:", {
      contratoId,
      oldValorTotal: contract.valor_total,
      valorMensal,
      monthCount,
      newValorTotal,
    })

    // Update contract with new total value
    const { error: updateError } = await supabase
      .from("contratos")
      .update({ valor_total: newValorTotal })
      .eq("id", contratoId)

    if (updateError) {
      console.error("[v0] Error updating contract total:", updateError)
      return { success: false, error: updateError.message }
    }

    // Regenerate monthly payments with correct values
    const result = await generateMonthlyPayments(
      contratoId,
      contract.data_inicio,
      contract.data_fim,
      valorMensal, // Pass the monthly value, not the total
    )

    if (!result.success) {
      return result
    }

    console.log("[v0] Monthly payments recalculated successfully")

    revalidatePath("/contratos/[id]", "page")
    revalidatePath("/pagamentos", "page")
    revalidatePath("/relatorios", "page")
    revalidatePath("/dashboard", "page")
    revalidatePath("/contratos", "page")

    return { success: true, newValorTotal }
  } catch (error) {
    console.error("[v0] Error in recalculateMonthlyPayments:", error)
    return { success: false, error: "Erro ao recalcular pagamentos mensais" }
  }
}
