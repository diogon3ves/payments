'use client'

import { useState } from 'react'

export default function QrPixPage() {
  const [inputValue, setInputValue] = useState('0')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copiaCola, setCopiaCola] = useState('')
  const [carregando, setCarregando] = useState(false)

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
      alert('Digite um valor válido')
      return
    }

    setCarregando(true)
    setQrCodeUrl('')
    setCopiaCola('')

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
      } else {
        alert('Erro ao gerar QR Code.')
      }
    } catch (err) {
      alert('Erro de conexão.')
    } finally {
      setCarregando(false)
    }
  }

  const { reaisFormatado } = formatarReais(inputValue)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-800 uppercase">INSIRA O VALOR</h1>

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

        {qrCodeUrl && (
          <div className="space-y-4">
            <img src={qrCodeUrl} alt="QR Code Pix" className="mx-auto w-48 h-48" />
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Copia e Cola:</p>
              <textarea
                className="w-full p-3 border rounded-lg text-sm"
                value={copiaCola}
                readOnly
                rows={3}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
