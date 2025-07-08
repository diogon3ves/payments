'use client'

import { useState, useRef } from 'react'
import { toast, Toaster } from 'sonner'

export default function QrPixPage() {
  const [inputValue, setInputValue] = useState('0')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copiaCola, setCopiaCola] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [exibindoQR, setExibindoQR] = useState(false)
  const qrRef = useRef<HTMLImageElement | null>(null)

  const formatarReais = (value: string) => {
    const numeric = value.replace(/\D/g, '')
    const centavos = parseInt(numeric || '0', 10)
    const reaisFormatado = (centavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return { reaisFormatado, valorNumero: centavos / 100 }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const apenasNumeros = value.replace(/\D/g, '')
    setInputValue(apenasNumeros)
  }

  const gerarQRCode = async () => {
    const { valorNumero } = formatarReais(inputValue)
    if (valorNumero < 1) {
      toast.error('Digite um valor válido')
      return
    }

    setCarregando(true)
    setQrCodeUrl('')
    setCopiaCola('')
    setExibindoQR(false)

    try {
      const res = await fetch('/api/deposito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: valorNumero })
      })

      const data = await res.json()
      if (data.qrCodeUrl && data.copiaCola) {
        setQrCodeUrl(data.qrCodeUrl)
        setCopiaCola(data.copiaCola)
        setExibindoQR(true)
        toast.success('PIX gerado com sucesso!')
      } else {
        toast.error('Erro ao gerar QR Code.')
      }
    } catch (err) {
      toast.error('Erro de conexão.')
    } finally {
      setCarregando(false)
    }
  }

  const copiarPix = () => {
    navigator.clipboard.writeText(copiaCola)
    toast.success('Chave Pix copiada!')
  }

  const copiarImagem = async () => {
    try {
      const image = qrRef.current
      if (!image) throw new Error()

      const data = await fetch(image.src)
      const blob = await data.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])

      toast.success('Imagem copiada!')
    } catch {
      toast.error('Erro ao copiar imagem')
    }
  }

  const { reaisFormatado } = formatarReais(inputValue)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Toaster position="top-center" richColors />
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-800 uppercase">
          {exibindoQR ? 'PIX GERADO' : 'INSIRA O VALOR'}
        </h1>

        {!exibindoQR && (
          <>
            <input
              type="text"
              inputMode="numeric"
              placeholder="R$ 0,00"
              className="w-full p-4 border border-blue-400 rounded-lg text-center text-xl font-semibold text-black outline-none focus:ring-2 focus:ring-blue-400"
              value={reaisFormatado}
              onChange={handleChange}
            />

            <button
              onClick={gerarQRCode}
              disabled={carregando}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 transition font-semibold text-lg"
            >
              {carregando ? 'Gerando...' : 'Gerar PIX'}
            </button>
          </>
        )}

        {exibindoQR && (
          <div className="space-y-4 flex flex-col items-center">
            <img
              ref={qrRef}
              src={qrCodeUrl}
              alt="QR Code Pix"
              className="w-48 h-48 cursor-pointer hover:opacity-80 transition"
              onClick={copiarImagem}
              title="Clique para copiar imagem"
            />

            <button
              onClick={copiarPix}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium w-48"
            >
              Copiar chave Pix
            </button>

            <button
              onClick={() => {
                setExibindoQR(false)
                setInputValue('0')
              }}
              className="mt-4 text-sm text-blue-600 underline hover:text-blue-800"
            >
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
