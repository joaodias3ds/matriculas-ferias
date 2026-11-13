# Matrícula de férias — Redação Nota Mil

Sistema público de matrícula de férias, com prioridade para celular, oito etapas de preenchimento e uma nona tela de finalização. O projeto usa a identidade visual oficial em `public/`, Cloudflare Workers para a API e Cloudflare D1 como banco principal. O código está em `https://github.com/joaodias3ds/matriculas-ferias`.

## O que o aluno faz

1. Escolhe se já tem matrícula. Nesse caso, informa o número e um celular que conste no cadastro antigo. A busca só devolve o registro se os dois dados coincidirem.
2. Confere ou informa nome, idade, telefone, WhatsApp, escola e série. Quem veio da base antiga pode corrigir os campos.
3. Confere ou informa nome e telefone da mãe e do pai. A etapa é opcional, mas cada responsável preenchido precisa ter nome e celular juntos.
4. Seleciona Redação, Gramática ou os dois.
5. Confere o plano e o valor correspondente.
6. Informa um e-mail válido.
7. Revê todos os dados.
8. Lê e aceita os informativos, a Política de Privacidade e os Termos de Uso.
9. Recebe na tela um protocolo de matrícula confirmada e links de retorno e contato.

A tela final é exibida apenas após o registro no banco. O limite de 30 vagas é verificado na mesma instrução de inserção que cria a matrícula. Uma matrícula antiga só pode ser usada uma vez. O envio automático de e-mail depende da configuração do provedor; sem ela, a confirmação imediata é o protocolo na tela.

## Cursos e valores

| Plano | Encontros | Valor |
| --- | --- | ---: |
| Redação | Segundas-feiras, dois encontros em novembro e dois em dezembro de 2026 | R$ 200,00 |
| Gramática | Sextas-feiras, dois encontros em novembro e dois em dezembro de 2026 | R$ 200,00 |
| Redação + Gramática | Os dois cursos, quatro encontros cada | R$ 400,00 |

Datas exatas, horários e condições de pagamento não foram informados e não são inventados pelo sistema. O administrador pode alterar os valores em `/admin.html` antes de novas matrículas. Cada inscrição guarda um retrato do plano e valor selecionados no momento da confirmação; alterações posteriores não mudam registros anteriores.

## Estrutura

- `public/index.html`, `app.js`, `style.css`: formulário e identidade visual.
- `public/admin.html`, `admin.js`: painel privado com todos os campos, aceites e horários.
- `public/privacidade.html`, `termos.html`: páginas de informação ao aluno.
- `src/worker.js`: API, validação no servidor, autenticação e limite de vagas.
- `schema-v2.sql`: tabelas de matrículas, alunos antigos, planos e limite de tentativas.
- `scripts/import-legacy.mjs`: importação local dos JSONs antigos.
- `wrangler.jsonc`: configuração de Worker e banco D1. O ID do banco não é uma senha.

A tabela `enrollments` de `schema.sql` pertence à primeira versão e fica apenas por compatibilidade. A versão atual usa `applications`. Não execute comandos para apagar tabelas ao atualizar.

## Dados antigos e privacidade

A origem usada nesta instalação é `D:\João - Computador\Redação Nota Mil - 2027\dados e chaves\Alunos JSON`. Foram importados 145 registros da exportação do sistema antigo. O importador lê `_indice.json` e cada arquivo de aluno e transfere apenas número da matrícula, nome, idade calculada, telefone, escola, série e nomes/telefones da mãe e do pai. CPF, RG, financeiro, frequência, endereços e chaves não são importados. Os JSONs originais não são adicionados ao Git.

A importação cria um SQL temporário no diretório de arquivos temporários do sistema, envia ao D1 e remove o arquivo em seguida. Mantenha o computador e a conta Cloudflare protegidos. A busca pública exige matrícula mais um celular cadastrado e limita tentativas por IP. O Redis pode executar esse limite de tentativas; sem Redis, o D1 executa o mesmo limite.

O rascunho local é opcional, expira em até sete dias e é apagado após a confirmação. Não salva a prova de busca da matrícula antiga; ao retomar, o aluno deve confirmar matrícula e celular novamente. A página de privacidade descreve o tratamento atual. A equipe deve revisar o texto e a política de retenção antes de divulgar o link amplamente, sobretudo porque há dados de menores. O formulário usa armazenamento local para o aviso de cookies e, somente se o aluno escolher, para o rascunho. A sessão administrativa usa cookie essencial `HttpOnly`, `Secure` e `SameSite=Strict`. Não há analytics ou cookies de publicidade.

## Requisitos

- Node.js 20 ou superior.
- Conta Cloudflare com Workers e D1.
- Wrangler autenticado (`npx wrangler login`).
- Para importar alunos, acesso local à pasta dos JSONs.

## Executar localmente

No PowerShell, na raiz do projeto:

```powershell
npm install
npx wrangler d1 execute matriculas-ferias --local --file schema-v2.sql
npm run dev
```

Abra o endereço mostrado pelo Wrangler. O banco local é separado do banco publicado. Para importar dados no banco local:

```powershell
node scripts/import-legacy.mjs 'D:\João - Computador\Redação Nota Mil - 2027\dados e chaves\Alunos JSON'
```

O painel exige `ADMIN_SECRET`. Para desenvolvimento local, crie `.dev.vars` com `ADMIN_SECRET=uma-senha-forte`; o arquivo está ignorado pelo Git. Nunca coloque senhas, tokens, exportações ou arquivos `.dev.vars` no repositório.

## Publicar na Cloudflare

A instância atual já usa o banco `matriculas-ferias`. Em uma instalação nova, crie outro D1 e substitua o `database_id` em `wrangler.jsonc` pelo ID retornado. Para atualizar esta instalação:

```powershell
npx wrangler d1 execute matriculas-ferias --remote --file schema-v2.sql
node scripts/import-legacy.mjs 'D:\João - Computador\Redação Nota Mil - 2027\dados e chaves\Alunos JSON' --remote
npx wrangler secret put ADMIN_SECRET
npm run deploy
```

O comando do segredo pede o valor sem gravá-lo no código. Nesta instalação, a senha gerada está somente no arquivo local `.admin-password.local`, ignorado pelo Git. Guarde-a em um gerenciador de senhas e remova a cópia local quando não precisar dela. Para trocar a senha, rode novamente `npx wrangler secret put ADMIN_SECRET` e informe a nova senha. Isso encerra a validade dos cookies antigos.

O endereço atual é `https://matriculas-ferias.jmdias2901.workers.dev`. Depois da publicação, confira `/api/availability`, `/api/plans`, o formulário e `/admin.html`. Evite enviar uma matrícula fictícia no ambiente publicado: ela consumirá uma das 30 vagas.

## Redis

Uma instância **Upstash Redis gratuita** foi conectada ao Worker por URL REST e token gravados como segredos da Cloudflare. Redis guarda apenas contadores temporários de tentativas de busca, envio e login. As chaves usam HMAC do IP; o endereço IP não é enviado em texto aberto ao Redis. O contador e sua expiração são atualizados em uma única operação Lua (`EVAL`). Cadastros e vagas permanecem no D1, que é a fonte de verdade. Em falha ou ausência do Redis, os contadores são mantidos no D1 para que a proteção não desapareça.

**Ação necessária para manter o Redis:** a instância gratuita criada sem cadastro expira após 72 horas, a menos que seja vinculada a uma conta Upstash gratuita. O link de vinculação está apenas no arquivo local `.redis-claim.local`, ignorado pelo Git. Abra-o e vincule a instância sem selecionar plano pago. Se não fizer isso, o formulário continuará funcionando com o limite de tentativas pelo D1.

Para substituir a instância por outra Upstash, configure os dois segredos no Worker:

```powershell
npx wrangler secret put UPSTASH_REDIS_REST_URL
npx wrangler secret put UPSTASH_REDIS_REST_TOKEN
npm run deploy
```

Use a URL REST `https://...` e o token REST da sua instância. Nunca use uma URL `redis://` no Worker, nem coloque o token no Git ou no navegador. Após configurar, teste tentativas repetidas em ambiente de desenvolvimento antes de depender do limite em produção.

## Administração

Acesse `/admin.html` e use a senha administrativa. O painel lista até 30 matrículas e mostra protocolo, matrícula anterior, aluno, idade, contatos, escola, série, responsáveis, cursos, plano, valor, e-mail e horários dos três aceites. Os registros vêm do servidor apenas após autenticação. A sessão dura oito horas e pode ser encerrada pelo botão Sair.

O painel permite ajustar preços para futuras inscrições. Não envia e-mail, não recebe pagamentos e não sincroniza alterações de volta ao sistema antigo. Se precisar corrigir um registro já confirmado, faça isso com cuidado diretamente no D1, mantendo um backup e um histórico da alteração.

## API e validação

- `GET /api/availability`: vagas restantes.
- `GET /api/plans`: planos ativos e valores públicos.
- `POST /api/legacy`: busca protegida por matrícula e celular.
- `POST /api/enroll`: valida todos os campos no servidor e cria a matrícula.
- `POST /api/admin/login`, `POST /api/admin/logout`: sessão administrativa.
- `GET /api/admin/applications`: registros completos, apenas administrador.
- `PUT /api/admin/plans`: alteração de valores, apenas administrador.

A validação no navegador ajuda o aluno, mas a decisão final é sempre do servidor. A API não fornece uma lista pública de alunos. Mensagens de erro não expõem dados do banco. Solicitações administrativas usam cookie de sessão restrito ao caminho `/api/admin`.

## Manutenção e segurança

Faça backup do D1 antes de mudanças de esquema e mantenha os JSONs antigos fora do repositório. Para conferir o total sem listar dados pessoais, use `/api/availability`. Revise mensalmente os preços e o texto dos encontros: esta versão descreve novembro e dezembro de 2026. Atualize os informativos, termos e planos para uma nova turma. Não reutilize uma implantação antiga com dados de alunos sem revisar finalidade, retenção e permissões de acesso.

Para suporte ao aluno, o link final abre o WhatsApp institucional `(62) 98189-9570`. Não há integração de pagamento nesta versão.

## Ativar e-mail de confirmação

A integração opcional usa Resend e envia ao aluno apenas nome e protocolo. Configure um domínio remetente verificado no provedor e depois grave os segredos no Worker:

```powershell
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONFIRMATION_FROM
npm run deploy
```

Use em `CONFIRMATION_FROM` um endereço autorizado pelo seu domínio. Sem estes segredos, o formulário continua registrando as vagas e informa que o protocolo na tela é a confirmação. Falha de e-mail não desfaz uma matrícula já registrada.

Dos 145 cadastros antigos, 104 têm pelo menos um celular válido para a busca automática. Os outros 41 precisam de atendimento da equipe para confirmar a identidade; o sistema não libera dados somente pelo número da matrícula.


Referência para a orientação sobre cookies: [Guia da ANPD sobre cookies e proteção de dados pessoais](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais).
