import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

/**
 * POST /api/submissions/upload
 * Upload a file for a submission
 * Accepts: PDF, DOC, DOCX
 * Max size: 10MB
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 10MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Permitidos: PDF, DOC, DOCX' },
        { status: 400 }
      )
    }

    // Get file extension
    const ext = path.extname(file.name)
    const allowedExts = ['.pdf', '.doc', '.docx']
    if (!allowedExts.includes(ext.toLowerCase())) {
      return NextResponse.json(
        { error: 'Extensão de arquivo inválida. Permitidas: .pdf, .doc, .docx' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50)
    const uniqueFileName = `${timestamp}-${randomString}-${safeFileName}`

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'submissions')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const filePath = path.join(uploadsDir, uniqueFileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return file info
    const fileUrl = `/uploads/submissions/${uniqueFileName}`

    return NextResponse.json({
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/submissions/upload
 * Delete an uploaded file
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { fileUrl } = await request.json()

    if (!fileUrl || !fileUrl.startsWith('/uploads/submissions/')) {
      return NextResponse.json(
        { error: 'URL de arquivo inválida' },
        { status: 400 }
      )
    }

    // Delete file from filesystem
    const fs = require('fs').promises
    const filePath = path.join(process.cwd(), 'public', fileUrl)

    try {
      await fs.unlink(filePath)
    } catch (err) {
      // File might not exist, that's ok
      console.warn('File not found for deletion:', filePath)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir arquivo' },
      { status: 500 }
    )
  }
}
