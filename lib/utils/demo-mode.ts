"use client"

// Hook para verificar se o modo demonstração está ativo
export function useDemoMode() {
  if (typeof window === "undefined") return false
  return localStorage.getItem("demo_mode") === "true"
}

// Função para ativar/desativar o modo demonstração
export function setDemoMode(enabled: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem("demo_mode", enabled ? "true" : "false")
}

// Funções para mascarar dados sensíveis
export function maskClientName(name: string, index?: number): string {
  if (typeof window === "undefined" || localStorage.getItem("demo_mode") !== "true") {
    return name
  }
  return index !== undefined ? `Cliente ${index + 1}` : "Cliente Exemplo"
}

export function maskCPF(cpf: string): string {
  if (typeof window === "undefined" || localStorage.getItem("demo_mode") !== "true") {
    return cpf
  }
  return "***.***.***-**"
}

export function maskPhone(phone: string): string {
  if (typeof window === "undefined" || localStorage.getItem("demo_mode") !== "true") {
    return phone
  }
  return "(XX) XXXXX-XXXX"
}

export function maskEmail(email: string): string {
  if (typeof window === "undefined" || localStorage.getItem("demo_mode") !== "true") {
    return email
  }
  return "cliente@exemplo.com"
}

export function maskAddress(address: string): string {
  if (typeof window === "undefined" || localStorage.getItem("demo_mode") !== "true") {
    return address
  }
  return "Rua Exemplo, 123 - São Paulo, SP"
}

export function maskCompany(company: string): string {
  if (typeof window === "undefined" || localStorage.getItem("demo_mode") !== "true") {
    return company
  }
  return "Empresa Exemplo Ltda"
}

// Função para mascarar valores monetários (opcional)
export function maskValue(value: number, round = false): number {
  if (typeof window === "undefined" || localStorage.getItem("demo_mode") !== "true") {
    return value
  }
  // Se round for true, arredonda para valores "bonitos" para demonstração
  if (round) {
    return Math.round(value / 100) * 100
  }
  return value
}
