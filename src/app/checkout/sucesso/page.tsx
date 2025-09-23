export const dynamic = "force-dynamic"

export default function CheckoutSuccessPage() {
  return (
    <main className="container py-12 space-y-4">
      <h1 className="text-2xl font-semibold">Pagamento aprovado</h1>
      <p className="text-muted-foreground">
        Recebemos a confirmação do seu pagamento. Você receberá um e-mail com os detalhes do pedido.
      </p>
      <a href="/" className="inline-block rounded border px-4 py-2 hover:bg-gray-50">
        Voltar para a loja
      </a>
    </main>
  )
}