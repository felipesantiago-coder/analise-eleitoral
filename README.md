# Voto Claro: Guia Eleitoral DF 2026, 2º turno

**Voto Claro** é um guia eleitoral independente, sem vínculo partidário: o
ranking é recalculado no navegador com a régua de valores de cada usuário e a
**pesquisa de intenção de voto** coleta votos anônimos no servidor. Após o
1º turno de **04/10/2026**, o aplicativo cobre os dois cargos decididos no 2º turno de
**25/10/2026** e apenas os seus 2 finalistas (os dois mais votados, apuração do TSE):

| Cargo | Finalistas do 2º turno |
|-------|------------------------|
| Presidente da República | Lula (PT, nº 13) × Flávio Bolsonaro (PL, nº 22) |
| Governador do DF | Leandro Grass (PT, nº 13) × Celina Leão (PP, nº 11) |

Senador (eleitas Michelle Bolsonaro e Bia Kicis), Deputado Federal e Deputado
Distrital foram definidos no 1º turno e saíram do app; as candidaturas eliminadas
permanecem listadas com a fonte do resultado, em "Fora da urna".

## O que há dentro

- **Régua pessoal em três graus**: para cada um dos 11 critérios o usuário escolhe
  **essencial**, **muito importante** ou **importante**; os pesos decrescem em 3:2:1,
  com soma 100% em cada cargo. A escolha fica salva no `localStorage`
  (`voto-claro:regua-v2`) e recalcula nota, ordem e triagem no cliente.
- **Ranking ponderado**: nota final 0 a 10 = soma de (nota do critério × peso),
  com critérios aplicáveis por abrangência: soberania e tecnologia só no Presidente;
  mobilidade só no Governador do DF.
- **Níveis de evidência A/B/C** em cada nota (A: transitado em julgado / tribunais de
  contas / registros oficiais; B: investigações formais em curso e decisões de 1º grau;
  C: reportagens e posicionamentos públicos).
- **Ficha por finalista**: partido, número de urna, coligação, vice, resumo analítico,
  nota por critério com justificativa e **links para todas as fontes**.
- **Pesquisa eleitoral anônima** (`#pesquisa`): urna com um voto por pessoa em cada
  cargo (com opção de voto em branco), resultados agregados após o voto e atualização
  automática; ver seção abaixo.
- **Documento-mãe em markdown**: disponível no app (`/analise-eleitoral-df-2026.md`)
  com metodologia, atualização do 1º turno, fichas dos finalistas e fontes.

## Pesquisa eleitoral anônima

A pesquisa (`/api/pesquisa/*`) coleta intenção de voto **sem nenhum dado pessoal**:

- **Anonimato**: os votos (`VotoPesquisa`) ficam numa tabela sem qualquer vínculo,
  chave estrangeira ou carimbo que os ligue ao identificador de deduplicação
  (`ChaveEleitor`). O identificador é um HMAC-SHA256 com sal secreto do servidor
  (nunca armazenado em claro): IP, user-agent e a impressão do navegador não podem
  ser reconstruídos a partir do banco. Mesmo com acesso total ao banco, não é
  possível dizer em quem alguém votou.
- **Um voto por pessoa, em camadas independentes**: (1) impressão do navegador
  (sinais estáveis + canvas, SHA-256, sem cookies identificáveis) recusa quem limpa
  cookies e troca de rede; (2) IP + user-agent recusa quem refaz a impressão e volta
  pela mesma rede; (3) limitação de taxa por IP (8 tentativas/10 min, 20 s entre
  tentativas); (4) campo-isca invisível e tempo mínimo de preenchimento contra bots.
  Sem identificação oficial (login/CPF) não existe garantia absoluta; a combinação
  torna voto repetido difícil e custoso — o máximo possível preservando o anonimato.
- **Resultados**: só agregados (total por candidato + brancos por cargo), exibidos
  após o voto para reduzir efeito carro-chefe, com aviso de que a amostra é
  autoselecionada e sem valor oficial.
- **Armazenamento**: SQLite via Prisma (`db/custom.db`); sal da pesquisa criado uma
  única vez na tabela `Configuracao`.

## Fontes dos dados

- Base oficial de candidaturas **`consulta_cand` 2026 do TSE** (dados abertos,
  extraída em 03/10/2026) e **resultado do 1º turno de 04/10/2026** (apuração oficial
  e imprensa: G1, UOL, Folha, Estadão, Gazeta do Povo).
- Portais oficiais (Câmara, Senado, TCDF) e imprensa: todos linkados nas fichas.

> **Aviso**: ferramenta de apoio à decisão, sem vínculo partidário e sem propaganda
> eleitoral. Notas são juízos editoriais informados e auditáveis; investigações sem
> condenação não equivalem a culpabilidade. Confirme a situação da candidatura no
> [DivulgaCandContas](https://divulgacandcontas.tse.jus.br/divulga/#/candidatos) antes de votar.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) + shadcn/ui (New York) + Lucide icons
- [next-themes](https://github.com/pacocoursey/next-themes) para o modo claro/escuro
- Dados estáticos (`src/data/analise.json`): sem banco de dados e sem API

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) + shadcn/ui (New York) + Lucide icons
- [next-themes](https://github.com/pacocoursey/next-themes) para o modo claro/escuro
- Dados estáticos (`src/data/analise.json`): ranking recalculado no cliente, sem API
- [Prisma](https://www.prisma.io/) + SQLite (`db/custom.db`): apenas para a pesquisa
  eleitoral (dois endpoints em `/api/pesquisa/*`)

## Modo servidor e build

O ranking é 100% client-side, mas a **pesquisa exige backend** (coleta de votos com
controle de duplicidade), então o projeto roda em modo servidor Node.

```bash
bun install
bun run dev       # http://localhost:3000 (desenvolvimento)
bun run lint
bun run build     # build de produção
bun run start     # next start (http://localhost:3000)
bun run db:push   # aplica o schema Prisma no SQLite
```

Copie `.env.example` para `.env` (variável `DATABASE_URL` do SQLite).

## Deploy

A pesquisa exige um processo Node persistente com acesso ao SQLite (o arquivo
`db/custom.db`). Opções gratuitas adequadas a uma VPS/container pequeno:
Render (free web service), Railway (trial), Fly.io ou uma VPS simples — rodando
`bun run build && bun run start` com o volume persistindo `db/`. Para pico de
concorrência no 2º turno, um prefixo de cache CDN na frente dos HTMLs ajuda; os
endpoints `/api/pesquisa/resultados` já emitem `Cache-Control` (s-maxage 15 s) e
podem ficar atrás de cache de borda, enquanto `/api/pesquisa/votar` nunca deve
ser cacheado.

> Nota: um deploy estático (`output: "export"`) volta a ser possível para o
> restante do app hospedando os dois endpoints da pesquisa como funções
> (Cloudflare Pages Functions + D1/KV ou Vercel Functions + Turso), trocando o
> Prisma/SQLite por esse banco; o código das camadas anti-duplicação não muda.

---

Análise original gerada em 03/10/2026 (véspera do 1º turno) e atualizada em
06/10/2026 com o resultado do 1º turno. O markdown completo com metodologia,
justificativas e fontes está em
[`public/analise-eleitoral-df-2026.md`](public/analise-eleitoral-df-2026.md).
