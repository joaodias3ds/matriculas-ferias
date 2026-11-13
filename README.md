# Matrícula de férias — Redação Nota Mil

Formulário mobile de cinco etapas com confirmação registrada no Cloudflare D1. O limite de 30 vagas é verificado no banco durante a inserção.

## Executar

```sh
npm install
npx wrangler d1 execute matriculas-ferias --local --file schema.sql
npm run dev
```

## Publicar

```sh
npx wrangler d1 execute matriculas-ferias --remote --file schema.sql
npm run deploy
```
