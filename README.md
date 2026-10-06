# Voto Claro: Guia Eleitoral DF 2026, 2º turno

**Voto Claro** é um guia eleitoral independente, sem banco de dados e sem servidor: o
ranking é recalculado no navegador com a régua de valores de cada usuário. Após o
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
- **Documento-mãe em markdown**: disponível no app (`/analise-eleitoral-df-2026.md`)
  com metodologia, atualização do 1º turno, fichas dos finalistas e fontes.

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

## Export estático

O projeto gera um **site 100% estático** (`output: "export"`): `bun run build`
produz o diretório `out/` com HTML/JS/CSS e as fotos. Como todo o processamento é
client-side, a escala fica por conta da CDN, sem servidor Node.

```bash
bun install
bun run dev     # http://localhost:3000 (desenvolvimento)
bun run lint
bun run build   # gera out/
bun run start   # serve out/ localmente (http://localhost:3000)
```

## Deploy no Cloudflare Pages (grátis, bandwidth ilimitada)

1. No dash.cloudflare.com, crie um projeto **Workers & Pages → Pages** conectado a
   este repositório GitHub (`felipesantiago-coder/voto-claro`, branch `main`).
2. Build command: `bun run build`
3. Build output directory: `out`
4. Nenhuma variável de ambiente é necessária (não há banco, API nem segredos).

Alternativa por CLI, sem conectar o Git:

```bash
bun run build
npx wrangler pages deploy out --project-name voto-claro
```

Com a CDN do Cloudflare, picos de centenas de milhares de acessos simultâneos
(ex.: dia do 2º turno) são servidos diretamente da borda.

---

Análise original gerada em 03/10/2026 (véspera do 1º turno) e atualizada em
06/10/2026 com o resultado do 1º turno. O markdown completo com metodologia,
justificativas e fontes está em
[`public/analise-eleitoral-df-2026.md`](public/analise-eleitoral-df-2026.md).
