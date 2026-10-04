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
}

export interface DadosAnalise {
  pesos: Partial<Record<ChaveCriterio, number>>;
  cargos: Cargo[];
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
  { chave: "desenvolvimento", nome: "Propostas concretas de desenvolvimento", curto: "Desenvolvimento", peso: 0.14 },
  { chave: "honestidade", nome: "Honestidade comprovada por evidências", curto: "Honestidade", peso: 0.18 },
  { chave: "ambiental", nome: "Visão ambiental responsável", curto: "Ambiental", peso: 0.1 },
  { chave: "soberania", nome: "Defesa dos interesses nacionais", curto: "Soberania", peso: 0.07 },
  { chave: "tecnologia", nome: "Fronteira tecnológica", curto: "Tecnologia", peso: 0.07 },
  { chave: "democracia", nome: "Compromisso com a democracia e o Estado de Direito", curto: "Democracia", peso: 0.09, complementar: true },
  { chave: "gestao", nome: "Capacidade de gestão e histórico de resultados", curto: "Gestão", peso: 0.07, complementar: true },
  { chave: "fiscal", nome: "Responsabilidade fiscal e uso dos recursos públicos", curto: "Fiscal", peso: 0.07, complementar: true },
  { chave: "social", nome: "Compromisso social e redução das desigualdades", curto: "Social", peso: 0.07, complementar: true },
  { chave: "mobilidade", nome: "Melhorias da mobilidade, com prioridade ao transporte público", curto: "Mobilidade", peso: 0.07, complementar: true },
];

/** Pesos aplicáveis a um cargo: usa os pesos próprios do cargo (cargos do DF,
 *  sem soberania e tecnologia por serem de abrangência nacional, e com
 *  mobilidade) quando existirem; cai para os pesos globais (Presidente) no
 *  restante. */
export const criteriosDoCargo = (cargo: Cargo | undefined): typeof CRITERIOS => {
  if (cargo?.pesos) {
    return CRITERIOS.filter((c) => typeof cargo.pesos?.[c.chave] === "number");
  }
  return CRITERIOS;
};

/** Peso efetivo de um critério no cargo (peso próprio do cargo ou global). */
export const pesoDoCargo = (cargo: Cargo | undefined, chave: ChaveCriterio): number => {
  const p = cargo?.pesos?.[chave];
  if (typeof p === "number") return p;
  return CRITERIOS.find((c) => c.chave === chave)?.peso ?? 0;
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
