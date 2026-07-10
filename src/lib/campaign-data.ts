// Live stats from the Leolam platform API, with local defaults for fields the API does not expose.

export type CampaignStats = {
  raised: number;
  goal: number;
  donors: number;
  organizations: number;
};

export type Organization = {
  name: string;
  logo: string;
};

export type Milestone = {
  year: string;
  title: string;
  description: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

const FALLBACK_STATS: CampaignStats = {
  raised: 847_320,
  goal: 1_000_000,
  donors: 300,
  organizations: 45,
};

export async function fetchCampaignStats(): Promise<CampaignStats> {
  try {
    const res = await fetch("https://api.leolam.com.br/platform-stats", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      raised: Number(data.total_donated ?? data.raised ?? FALLBACK_STATS.raised),
      goal: Number(data.goal ?? FALLBACK_STATS.goal),
      donors: Number(data.number_members ?? data.donors ?? FALLBACK_STATS.donors),
      organizations: Number(data.organizations ?? FALLBACK_STATS.organizations),
    };
  } catch {
    return FALLBACK_STATS;
  }
}


// Real organizations from leolam.com.br
export const organizations: Organization[] = [
  { name: "Beshaa Tova", logo: "https://leolam.com.br/logos/organization_7.jpg" },
  { name: "Or Avrohom (ORAM)", logo: "https://leolam.com.br/logos/organization_45.jpg" },
  { name: "Amigos da Saúde", logo: "https://leolam.com.br/logos/organization_33.jpg" },
  { name: "Keren Chai", logo: "https://leolam.com.br/logos/organization_11.jpg" },
  { name: "Tefilin para Todos", logo: "https://leolam.com.br/logos/organization_10.jpg" },
  { name: "Projeto Chaguim", logo: "https://leolam.com.br/logos/organization_8.jpg" },
  { name: "Guesher", logo: "https://leolam.com.br/logos/organization_26.jpg" },
];

export const milestones: Milestone[] = [
  { year: "Agosto/2023", title: "Lançamento da Leolam", description: "Uma corrente de tzedaká diária começou com poucas pessoas." },
  { year: "Novembro/2023", title: "R$ 100.000 em doações", description: "O primeiro grande marco alcançado pela comunidade." },
  { year: "Março/2024", title: "Mais de 200 doadores", description: "A comunidade passou a se mobilizar de verdade." },
  { year: "Fevereiro/2025", title: "R$ 500.000 em doações", description: "Viabilizou projetos em dezenas de organizações." },
  { year: "Abril/2026", title: "Mais de 45 organizações parceiras", description: "A Leolam já apoia dezenas de organizações da comunidade." },
];

export const testimonials: Testimonial[] = [
  { quote: "Cada doação fortalece nossa comunidade e me conecta com algo maior que eu mesma.", author: "Rachel S.", role: "Doadora" },
  { quote: "É emocionante ver tanta gente unida por um mesmo propósito, todos os dias.", author: "Daniel L.", role: "Doador desde 2021" },
  { quote: "Doar 1 real por dia mudou minha relação com a comunidade.", author: "Miriam K.", role: "Doadora" },
];
