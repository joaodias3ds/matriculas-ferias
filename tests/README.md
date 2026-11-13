# Testes locais de segurança e funcionamento

Os scripts usam exclusivamente http://127.0.0.1:8788. Não apontam para produção.

Prepare um banco local com schema-v2.sql, schema-v3.sql, schema-v4.sql, schema-v4-indexes.sql, schema-v5.sql e schema-v6.sql, nessa ordem. As migrações com ALTER TABLE devem ser aplicadas uma vez. Aplique update-modalities.sql para os dois planos atuais.

Configure ADMIN_SECRET=test-local-security em .dev.vars (arquivo ignorado pelo Git). Insira no banco local uma matrícula fictícia TESTSEC, nome Aluno Teste Segurança, telefone e WhatsApp 62911112222. Nunca use dados pessoais reais para estes testes.

Execute npm run dev -- --port 8788 e, em outro terminal:

```sh
node tests/security.mjs
node tests/capacity.mjs
```

O primeiro script testa autenticação, origem, limites de corpo, validação, preços calculados no servidor, matrícula existente, duplicidade e operações administrativas. O segundo dispara 35 pedidos simultâneos e verifica o teto de 30 vagas. Os registros criados são removidos da lista ativa ao concluir. Os testes de limitação de login devem ser feitos depois dos demais, pois bloqueiam novos logins temporariamente.
