# Guia Eleitoral DF 2026 — Ranking de Compatibilidade

Dashboard responsivo (desktop e mobile) com o ranking de compatibilidade dos 5 candidatos
mais aderentes a um conjunto de seis valores pessoais, para cada cargo da eleição de
**04/10/2026 no Distrito Federal**:

| Cargo | Vagas | Candidatos analisados |
|-------|-------|------------------------|
| Presidente da República | 1 | 5 |
| Governador do DF | 1 | 5 |
| Senador | 2 | 5 |
| Deputado Federal | 8 | 5 |
| Deputado Distrital | 24 | 5 |

## O que há dentro

- **Ranking ponderado** — nota final 0–10 = soma de (nota do critério × peso):
  Honestidade 25%, Transparência 20%, Desenvolvimento 20%, Ambiental 15%,
  Soberania 10%, Tecnologia 10%.
- **Níveis de evidência A/B/C** em cada nota — A: transitado em julgado / tribunais de
  contas / registros oficiais; B: investigações formais em curso e decisões de 1º grau;
  C: reportagens e posicionamentos públicos.
- **Ficha por candidato** — partido, número de urna, coligação, vice, resumo analítico,
  nota por critério com justificativa e **links para todas as fontes**.
- **Candidaturas fora da urna documentadas** — Pablo Marçal e José Roberto Arruda
  (registros negados pelo TSE) e Ronaldo Fonseca (renúncia), com fontes.
- **Documento-mãe em markdown** — disponível no app (`/analise-eleitoral-df-2026.md`)
  com a metodologia completa.

## Fontes dos dados

- Base oficial de candidaturas **`consulta_cand` 2026 do TSE** (dados abertos, extraída
  em 03/10/2026) — nomes, partidos, números e coligações.
- Pesquisas de intenção de voto (Datafolha, Quaest, BTG/Nexus, AtlasIntel, Igape,
  Real Time Big Data) para definir o top 5 dos cargos proporcionais.
- Portais oficiais (Câmara, Senado, TCDF) e imprensa — todos linkados nas fichas.

> **Aviso**: ferramenta de apoio à decisão, sem vínculo partidário e sem propaganda
> eleitoral. Notas são juízos editoriais informados e auditáveis; investigações sem
> condenação não equivalem a culpabilidade. Confirme a situação da candidatura no
> [DivulgaCandContas](https://divulgacandcontas.tse.jus.br/divulga/#/candidatos) antes de votar.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/) + shadcn/ui (New York) + Lucide icons
- Dados estáticos (`src/data/analise.json`) — sem banco de dados; fotos otimizadas
  via `next/image`
- Pronto para deploy em 1 clique na [Vercel](https://vercel.com)

## Rodando localmente

```bash
bun install
bun run dev     # http://localhost:3000
bun run lint
```

## Deploy na Vercel

1. Importe o repositório em vercel.com/new
2. Framework preset: **Next.js** (detectado automaticamente)
3. Deploy — não requer variáveis de ambiente nem banco de dados.

---

Análise gerada em 03/10/2026 (véspera do 1º turno) a partir de fontes públicas.
O markdown completo com metodologia, justificativas e fontes está em
[`public/analise-eleitoral-df-2026.md`](public/analise-eleitoral-df-2026.md).
