This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Login (Supabase)

O app tem uma etapa de login com Supabase Auth (email + senha e link mágico).

1. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase → Project Settings → API).
   A publishable key nova (`sb_publishable_...`) é a recomendada; a anon key
   legada (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) também é aceita.
2. Reinicie o `npm run dev`.

Com as variáveis definidas, o `proxy.ts` (Middleware do Next 16) protege todas as
rotas e redireciona quem não está autenticado para `/login`. **Sem** as variáveis, o
app roda em modo local (localStorage) e o login fica desativado — nada quebra.

Peças principais:

- `app/login/` — tela de login + Server Actions (`authenticate`, `signOut`)
- `app/auth/confirm/` — verificação do token de confirmação/link mágico
- `lib/supabase/` — clients (`client`/`server`), `proxy` (refresh de sessão) e `config`
- `proxy.ts` — gate de rotas na borda

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
