import raw from "@/data/analise.json";

export type Nivel = "A" | "B" | "C";

export interface Fonte {
  titulo: string;
  url: string;
}

export interface Criterio {
  nota: number;
  nivel: Nivel;
  texto: string;
}

export type ChaveCriterio =
  | "transparencia"
  | "desenvolvimento"
  | "honestidade"
  | "ambiental"
  | "soberania"
  | "tecnologia"
  | "democracia"
  | "gestao"
  | "fiscal"
  | "social"
  | "mobilidade";

export interface Candidato {
  nome_urna: string;
  partido: string;
  numero: string;
  vice: string;
  coligacao: string;
  foto: string;
  slug: string;
  foto_url: string;
  resumo: string;
  criterios: Record<ChaveCriterio, Criterio>;
  score_total: number;
  ranking: number;
  fontes: Fonte[];
}

export interface Excluido {
  nome: string;
  motivo: string;
  fontes: Fonte[];
}

export interface PosicaoRanking {
  pos: number;
  nome_urna: string;
  partido: string;
  numero: string;
  score_total: number;
  base: "perfil" | "mandato" | "triagem";
}

/** Candidatura apta com notas por critério quando disponíveis (texto nulo
 *  cai para o texto padrão de triagem no cliente). */
export interface Apto {
  numero: string;
  nome_urna: string;
  partido: string;
  base: "perfil" | "triagem";
  score_padrao: number;
  vice?: string;
  coligacao?: string;
  resumo?: string;
  fontes?: Fonte[];
  foto?: string;
  slug?: string;
  foto_url?: string;
  criterios?: Record<string, { nota: number; nivel: Nivel; texto: string | null }> | null;
}

export interface Cargo {
  cargo: string;
  titulo: string;
  vagas: number;
  escopo: string;
  intro: string;
  total_registros: number;
  total_aptos: number;
  pesos?: Partial<Record<ChaveCriterio, number>>;
  excluidos: Excluido[];
  inaptos: Excluido[];
  candidatos: Candidato[];
  restante: PosicaoRanking[];
  aptos?: Apto[];
}

export interface DadosAnalise {
  pesos: Partial<Record<ChaveCriterio, number>>;
  cargos: Cargo[];
  textos_padrao?: { triagem: Record<string, string> };
}

export const dados = raw as unknown as DadosAnalise;

export const CRITERIOS: {
  chave: ChaveCriterio;
  nome: string;
  curto: string;
  peso: number;
  complementar?: boolean;
}[] = [
  { chave: "transparencia", nome: "Transparência e prestação de contas", curto: "Transparência", peso: 0.14 },
  { chave: "desenvolvimento", nome: "Propostas concretas de desenvolvimento", curto: "Desenvolvimento", peso: 0.05 },
  { chave: "honestidade", nome: "Honestidade comprovada por evidências", curto: "Honestidade", peso: 0.14 },
  { chave: "ambiental", nome: "Visão ambiental responsável", curto: "Ambiental", peso: 0.05 },
  { chave: "soberania", nome: "Defesa dos interesses nacionais", curto: "Soberania", peso: 0.14 },
  { chave: "tecnologia", nome: "Fronteira tecnológica", curto: "Tecnologia", peso: 0.14 },
  { chave: "democracia", nome: "Compromisso com a democracia e o Estado de Direito", curto: "Democracia", peso: 0.05, complementar: true },
  { chave: "gestao", nome: "Capacidade de gestão e histórico de resultados", curto: "Gestão", peso: 0.14, complementar: true },
  { chave: "fiscal", nome: "Responsabilidade fiscal e uso dos recursos públicos", curto: "Fiscal", peso: 0.10, complementar: true },
  { chave: "social", nome: "Compromisso social e redução das desigualdades", curto: "Social", peso: 0.05, complementar: true },
  { chave: "mobilidade", nome: "Melhorias da mobilidade, com prioridade ao transporte público", curto: "Mobilidade", peso: 0.08, complementar: true },
];

/** Conjunto de critérios de um cargo. Os pesos exibidos em `peso` e nos
 *  `pesos` do JSON são apenas a régua padrão da redação (base do documento
 *  estático); no aplicativo a régua efetiva é a do usuário, derivada em
 *  `pesosPersonalizados`. O conjunto de critérios é estrutural: cargos do DF
 *  não recebem soberania e tecnologia (abrangência nacional) e recebem
 *  mobilidade. */
export const criteriosDoCargo = (cargo: Cargo | undefined): typeof CRITERIOS => {
  if (cargo?.pesos) {
    return CRITERIOS.filter((c) => typeof cargo.pesos?.[c.chave] === "number");
  }
  return CRITERIOS;
};

/** Peso padrão da redação para um critério no cargo (régua do documento
 *  estático; no aplicativo use `pesosPersonalizados`). */
export const pesoDoCargo = (cargo: Cargo | undefined, chave: ChaveCriterio): number => {
  const p = cargo?.pesos?.[chave];
  if (typeof p === "number") return p;
  return CRITERIOS.find((c) => c.chave === chave)?.peso ?? 0;
};

/* ------------------------------------------------------------------ */
/* Régua personalizada: o usuário escolhe os critérios principais      */
/* ------------------------------------------------------------------ */

/** Escolha do usuário: true = critério principal; false/ausente = comum. */
export type EscolhaCriterios = Partial<Record<ChaveCriterio, boolean>>;

export const CHAVES_CRITERIOS = CRITERIOS.map((c) => c.chave);

/** Critérios aplicáveis a cada conjunto de cargos (abrangência). */
export const APLICAVEIS_PRESIDENTE: ChaveCriterio[] = [
  "transparencia", "desenvolvimento", "honestidade", "ambiental",
  "soberania", "tecnologia", "democracia", "gestao", "fiscal", "social",
];
export const APLICAVEIS_DF: ChaveCriterio[] = [
  "transparencia", "desenvolvimento", "honestidade", "ambiental",
  "democracia", "gestao", "fiscal", "social", "mobilidade",
];

/** Sugestão da redação (critérios principais predefinidos). */
export const CHAVES_SUGESTAO: ChaveCriterio[] = ["honestidade", "transparencia", "gestao", "fiscal"];

/** Peso dentro de um grupo de N critérios com K principais: cada principal
 *  pesa o dobro de um comum; dentro de cada grupo todos têm o mesmo peso.
 *  Com nenhum (ou todos) principal, todos ficam com peso igual. */
export const pesoGrupo = (n: number, k: number): { principal: number; comum: number } => {
  if (k === 0 || k === n) return { principal: 1 / n, comum: 1 / n };
  return { principal: 2 / (n + k), comum: 1 / (n + k) };
};

/** Chaves de critérios aplicáveis a um cargo (conjunto estrutural do cargo). */
export const chavesAplicaveis = (cargo: Cargo | undefined): ChaveCriterio[] => {
  if (cargo?.pesos) return Object.keys(cargo.pesos) as ChaveCriterio[];
  return CHAVES_CRITERIOS;
};

/** Pesos personalizados de um cargo conforme a escolha do usuário. */
export const pesosPersonalizados = (
  cargo: Cargo | undefined,
  escolha: EscolhaCriterios,
): Record<ChaveCriterio, number> => {
  const chaves = chavesAplicaveis(cargo);
  const n = chaves.length;
  const k = chaves.filter((c) => escolha[c]).length;
  const { principal, comum } = pesoGrupo(n, k);
  const out = {} as Record<ChaveCriterio, number>;
  for (const c of chaves) out[c] = escolha[c] ? principal : comum;
  return out;
};

export interface PosicaoApto {
  apto: Apto;
  score: number;
  pos: number;
}

/** Recalcula a classificação de um cargo com a régua do usuário. Candidatos
 *  sem notas por critério completas ficam em "semFicha" e não recebem
 *  posição personalizada. Empates ordenam alfabeticamente. */
export const pontuaCargo = (
  cargo: Cargo,
  escolha: EscolhaCriterios,
): { ranqueados: PosicaoApto[]; semFicha: Apto[] } => {
  const pesos = pesosPersonalizados(cargo, escolha);
  const aplicaveis = chavesAplicaveis(cargo);
  const comFicha: PosicaoApto[] = [];
  const semFicha: Apto[] = [];
  for (const apto of cargo.aptos ?? []) {
    const crit = apto.criterios;
    if (!crit || !aplicaveis.every((c) => crit[c])) {
      semFicha.push(apto);
      continue;
    }
    const bruto = aplicaveis.reduce((s, c) => s + crit[c].nota * pesos[c], 0);
    comFicha.push({ apto, score: Math.round(bruto * 100) / 100, pos: 0 });
  }
  comFicha.sort(
    (a, b) => b.score - a.score || a.apto.nome_urna.localeCompare(b.apto.nome_urna, "pt-BR"),
  );
  comFicha.forEach((p, i) => (p.pos = i + 1));
  return { ranqueados: comFicha, semFicha };
};

/** Fontes renderizáveis: descarta entradas corrompidas (título/url de
 *  placeholder da migração ou URL sem http) para que nenhum link morto
 *  chegue à interface. */
export const fontesValidas = (fontes: Fonte[] | undefined): Fonte[] =>
  (fontes ?? []).filter(
    (f) =>
      typeof f?.titulo === "string" &&
      f.titulo.trim().toLowerCase() !== "titulo" &&
      typeof f?.url === "string" &&
      /^https?:\/\//.test(f.url.trim()) &&
      f.url.trim().toLowerCase() !== "url",
  );

/** Ficha completa (tipo Candidato) a partir de um apto ranqueado; textos
 *  nulos e resumo caem para o padrão de triagem. */
export const fichaDeApto = (p: PosicaoApto, cargo: Cargo): Candidato => {
  const { apto, score, pos } = p;
  const padroes = dados.textos_padrao?.triagem ?? {};
  const criterios = {} as Record<ChaveCriterio, Criterio>;
  for (const c of CRITERIOS) {
    const cr = apto.criterios?.[c.chave];
    if (!cr) continue;
    criterios[c.chave] = {
      nota: cr.nota,
      nivel: cr.nivel,
      texto: cr.texto ?? padroes[c.chave] ?? "Sem evidências específicas localizadas.",
    };
  }
  return {
    nome_urna: apto.nome_urna,
    partido: apto.partido,
    numero: apto.numero,
    vice: apto.vice ?? "",
    coligacao: apto.coligacao ?? "",
    foto: apto.foto ?? "",
    slug: apto.slug ?? "",
    foto_url: apto.foto_url ?? "",
    resumo: apto.resumo || (apto.base === "triagem" ? padroes.resumo ?? "" : ""),
    criterios,
    score_total: score,
    ranking: pos,
    fontes: fontesValidas(apto.fontes),
  };
};

/** Notas fixas do perfil de triagem (candidatura sem registros públicos
 *  localizados), definidas no pipeline de análise (scripts/build_final.py) e
 *  idênticas para todas as candidaturas de triagem; servem para recalcular a
 *  nota padrão de qualquer cargo com a régua do usuário. Com a régua padrão
 *  da redação, reproduz 3,62 no Presidente e 3,76 nos cargos do DF. */
export const NOTAS_TRIAGEM: Record<ChaveCriterio, number> = {
  transparencia: 4,
  desenvolvimento: 3,
  honestidade: 5,
  ambiental: 3,
  soberania: 3,
  tecnologia: 3,
  democracia: 5,
  gestao: 3,
  fiscal: 4,
  social: 3,
  mobilidade: 3,
};

/** Nota padrão de triagem do cargo recalculada com a régua do usuário. */
export const notaTriagemCargo = (
  cargo: Cargo,
  escolha: EscolhaCriterios,
): number => {
  const pesos = pesosPersonalizados(cargo, escolha);
  const aplicaveis = chavesAplicaveis(cargo);
  const bruto = aplicaveis.reduce((s, c) => s + NOTAS_TRIAGEM[c] * pesos[c], 0);
  return Math.round(bruto * 100) / 100;
};

/** Percentual em formato brasileiro (uma casa quando necessário). */
export const formatPct = (p: number): string => {
  const v = Math.round(p * 1000) / 10;
  return (Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",")) + "%";
};

export const NIVEL_INFO: Record<Nivel, { label: string; cor: string; desc: string }> = {
  A: {
    label: "Evidência A",
    cor: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-900",
    desc: "Transitada em julgado, tribunal de contas ou registro oficial",
  },
  B: {
    label: "Evidência B",
    cor: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-900",
    desc: "Investigação formal em curso, decisão de 1º grau ou dado oficial revisável",
  },
  C: {
    label: "Evidência C",
    cor: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700",
    desc: "Reportagem, posicionamento público ou declaração sem comprovação documental",
  },
};

export const corNota = (n: number): string => {
  if (n >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (n >= 6) return "text-lime-600 dark:text-lime-400";
  if (n >= 4) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

export const iniciais = (nome: string): string => {
  const limpo = nome.replace(/^(ESCRITOR|ESCRITORA|PROFESSOR|PROFESSORA|DEPUTAD[OA]|DR\.?|SENADOR[A]?)\s+/i, "");
  const partes = limpo.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
};
