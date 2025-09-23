import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import Stripe from "stripe"

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY não encontrado. Preços no Stripe não serão criados automaticamente.")
}
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" }) : null

async function upsertAdmin() {
  const email = "test@admin.com"
  const password = "test1234"
  const hash = await bcrypt.hash(password, 10)
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hash,
      role: UserRole.ADMIN,
    },
    create: {
      email,
      name: "Test Admin",
      password: hash,
      role: UserRole.ADMIN,
    },
  })
  console.log("Usuário de teste 'test@admin.com' garantido com role ADMIN.")
  return admin
}

async function createCategories() {
  const cats = [
    { name: "Camisetas", slug: "camisetas" },
    { name: "Acessórios", slug: "acessorios" },
  ]
  for (const c of cats) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    })
  }
  return prisma.category.findMany()
}

async function ensureStripePrice(name: string, amountCents: number, currency = "BRL") {
  if (!stripe) return undefined
  const product = await stripe.products.create({ name })
  const price = await stripe.prices.create({
    unit_amount: amountCents,
    currency: currency.toLowerCase(),
    product: product.id,
  })
  return price.id
}

async function createProducts() {
  const categorias = await prisma.category.findMany()
  const map = new Map(categorias.map(c => [c.slug, c.id]))

  const base = [
    {
      name: "Camiseta Next.js",
      slug: "camiseta-nextjs",
      description: "Camiseta 100% algodão com estampa Next.js",
      priceCents: 7990,
      currency: "BRL",
      stock: 100,
      images: ["https://images.unsplash.com/photo-1520975922327-4c24fbc8b7b3"],
      categorySlug: "camisetas",
    },
    {
      name: "Boné Dev",
      slug: "bone-dev",
      description: "Boné estiloso para devs",
      priceCents: 5590,
      currency: "BRL",
      stock: 50,
      images: ["https://images.unsplash.com/photo-1516826957135-700dedea698c"],
      categorySlug: "acessorios",
    },
  ]

  for (const p of base) {
    let stripePriceId: string | undefined
    try {
      stripePriceId = await ensureStripePrice(p.name, p.priceCents, p.currency)
    } catch (e) {
      console.warn("Falha ao criar preço no Stripe para", p.slug, e)
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        stock: p.stock,
        images: p.images,
        stripePriceId,
        categoryId: map.get(p.categorySlug),
        active: true,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        stock: p.stock,
        images: p.images,
        stripePriceId,
        categoryId: map.get(p.categorySlug),
        active: true,
      },
    })
  }
}

async function main() {
  await upsertAdmin()
  await createCategories()
  await createProducts()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })