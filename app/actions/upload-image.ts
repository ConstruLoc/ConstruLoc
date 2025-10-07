"use server"

export async function uploadImage(formData: FormData) {
  try {
    console.log("[v0] Starting image upload")

    const file = formData.get("file") as File
    if (!file) {
      return {
        success: false,
        error: "Nenhum arquivo fornecido",
      }
    }

    console.log("[v0] File received:", file.name, file.size, file.type)

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Tipo de arquivo não permitido. Use JPG, PNG ou WebP.",
      }
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Arquivo muito grande. Máximo 5MB.",
      }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("[v0] Image converted to base64, size:", dataUrl.length)

    return {
      success: true,
      url: dataUrl,
      path: file.name,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    console.log("[v0] Upload error:", errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}
