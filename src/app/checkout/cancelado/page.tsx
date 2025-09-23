export const dynamic = "force-dynamic"

export default function CheckoutCanceledPage() {
  return (
    <main className="container py-12 space-y-4">
      <h1 className="text-2xl font-semibold">Pagamento cancelado</h1>
      <p className="text-muted-foreground">
        Seu pagamento foi cancelado ou não pôde ser concluído. Você pode revisar seu carrinho e tentar novamente.
      </p>
      <div className="flex gap-3">
        <a href="/carrinho" className="inline-block rounded border px-4 py-2 hover:bg-gray-50">
          Ir para o carrinho
        </a>
        <a href="/" className="inline-block rounded border px-4 py-2 hover:bg-gray-50">
          Voltar para a loja
        </a>
      </div>
    </main>
  )
}