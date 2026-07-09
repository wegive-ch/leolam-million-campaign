import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  Share2,
  Users,
  Building2,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Copy,
  Check,
  MessageCircle,
  ArrowRight,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import heroCoin from "@/assets/hero-coin.jpg";
import {
  fetchCampaignStats,
  organizations,
  milestones,
  type CampaignStats,
} from "@/lib/campaign-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Missão 1 Milhão — Leolam" },
      {
        name: "description",
        content:
          "Junte-se à comunidade na Missão 1 Milhão. Estamos a poucos passos de alcançar R$ 1.000.000 em doações.",
      },
      { property: "og:title", content: "Missão 1 Milhão — Leolam" },
      {
        property: "og:description",
        content: "Faça parte de um marco histórico. Cada doação conta.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: MissaoLanding,
});

const DONATE_URL = "https://leolam.com.br/doe-agora";
const SHARE_URL = "https://leolam.com.br/missao-1-milhao";
const SHARE_TEXT =
  "Estamos chegando a R$ 1.000.000 em doações na Missão 1 Milhão da Leolam. Faça parte:";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function useCountUp(target: number, durationMs = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.15 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </div>
  );
}

export function MissaoLanding() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => fetchCampaignStats().then((s) => alive && setStats(s));
    load();
    const id = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero stats={stats} />
      <Mission />
      <Impact stats={stats} />
      <Community />
      <Footer />
    </main>

  );
}

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-navy-deep/70 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <a href="https://leolam.com.br" className="flex items-center gap-2">
          <span className="font-display font-black text-2xl tracking-tight text-mint">
            leolam
          </span>
        </a>
        <a
          href={DONATE_URL}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-mint px-4 py-2 text-sm font-bold text-navy-deep shadow-glow hover:scale-105 transition-transform"
        >
          Doe agora <ChevronRight className="size-4" />
        </a>
      </div>
    </header>
  );
}

function Hero({ stats }: { stats: CampaignStats | null }) {
  const raised = useCountUp(stats?.raised ?? 0);
  const goal = stats?.goal ?? 1_000_000;
  const pct = stats ? Math.min(100, (stats.raised / stats.goal) * 100) : 0;
  const remaining = stats ? Math.max(0, stats.goal - stats.raised) : 0;
  const animPct = useCountUp(Math.round(pct * 10), 1800) / 10;

  return (
    <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-hero text-white">
      {/* glow orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-mint/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-mint/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-5 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-white/5 px-3 py-1 text-xs font-semibold text-mint backdrop-blur">
              <Sparkles className="size-3.5" /> Missão 1 Milhão
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 font-display font-black text-[2rem] sm:text-5xl lg:text-6xl leading-[1.05] text-balance">
              Estamos chegando a{" "}
              <span className="text-mint">R$ 1.000.000</span> em doações.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 text-white/80 text-base sm:text-lg leading-relaxed max-w-xl">
              Mais de 300 pessoas já contribuiram com dezenas de organizações
              através da Leolam. Falta muito pouco para
              alcançarmos esse marco histórico — e você pode fazer parte dessa conquista.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8 rounded-3xl border border-white/15 bg-white/5 p-5 sm:p-6 backdrop-blur-md shadow-elegant">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs uppercase tracking-widest text-mint font-bold">
                    Arrecadado
                  </div>
                  <div className="font-display font-black text-2xl sm:text-4xl tabular-nums">
                    {stats ? brl(raised) : "—"}
                  </div>
                </div>
                <div className="min-w-0 text-right">
                  <div className="text-[10px] sm:text-xs uppercase tracking-widest text-white/60 font-bold">
                    Meta
                  </div>
                  <div className="font-display font-bold text-lg sm:text-2xl text-white/90 tabular-nums">
                    {brl(goal)}
                  </div>
                </div>
              </div>

              <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-mint rounded-full transition-[width] duration-[1800ms] ease-out shadow-glow"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 justify-between text-xs font-semibold">
                <span className="text-mint">{animPct.toFixed(1)}% concluído</span>
                <span className="text-white/70">
                  Faltam {brl(remaining)}
                </span>
              </div>

              <p className="mt-4 text-sm text-white/80 leading-snug">
                Faltam apenas <span className="font-bold text-mint">{brl(remaining)}</span>{" "}
                para a comunidade alcançar R$ 1.000.000 em doações.
              </p>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={DONATE_URL}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-mint px-6 py-3.5 text-sm sm:text-base font-bold text-navy-deep shadow-glow hover:scale-[1.03] active:scale-[0.98] transition-transform text-center tracking-wide"
              >
                DOAR AGORA
                <ArrowRight className="size-5 shrink-0" />
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={300}>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-mint/20 blur-2xl" />
            <img
              src={heroCoin}
              alt="Mão segurando uma moeda de 1 real — símbolo da Missão 1 Milhão"
              width={1280}
              height={1280}
              className="relative rounded-[2rem] object-cover w-full aspect-square shadow-elegant"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section className="relative py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <Reveal>
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-navy-deep uppercase tracking-widest">
            A campanha
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="mt-4 font-display font-black text-3xl sm:text-5xl leading-tight text-balance">
            Vamos chegar juntos ao <span className="text-mint-dark">primeiro milhão</span>.
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <div className="mt-6 space-y-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            <p>
              A <strong className="text-foreground">Missão 1 Milhão</strong> é uma mobilização
              de toda a comunidade para alcançarmos R$ 1.000.000 em doações o mais rápido
              possível.
            </p>
            <p>
              Mesmo que você não possa doar um grande valor, sua participação faz diferença.
              Além de doar, compartilhe esta campanha e convide outras pessoas para acelerar
              essa missão.
            </p>
          </div>
        </Reveal>

        {/* Destaque: Sorteio + incentivo do mês */}
        <Reveal delay={220}>
          <div className="mt-10 relative rounded-3xl overflow-hidden bg-gradient-hero p-[2px] shadow-glow">
            <div className="rounded-[calc(1.5rem-2px)] bg-navy-deep text-white p-6 sm:p-10 text-left">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-[11px] font-black text-navy-deep uppercase tracking-widest">
                  <Sparkles className="size-3.5" /> Apenas em julho
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/40 px-3 py-1 text-[11px] font-bold text-mint uppercase tracking-widest">
                  Tempo limitado
                </span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-4xl leading-tight text-balance">
                Doe neste mês e concorra a um{" "}
                <span className="text-mint">vale-presente de R$ 500 na Benny.K Jewelry</span>.
              </h3>
              <p className="mt-4 text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl">
                Durante todo o mês de <strong className="text-white">julho</strong>, cada
                doação realizada gera <strong className="text-mint">1 número da sorte</strong>{" "}
                para concorrer a um vale-presente de R$ 500 na Benny.K Jewelry. Quanto mais
                você doa, mais chances você tem — e mais perto a comunidade chega dos
                R$ 1.000.000.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="text-mint font-display font-black text-2xl">1</div>
                  <div className="text-sm text-white/80 mt-1">Doe qualquer valor pela Leolam</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="text-mint font-display font-black text-2xl">2</div>
                  <div className="text-sm text-white/80 mt-1">Receba automaticamente seus números da sorte</div>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="text-mint font-display font-black text-2xl">3</div>
                  <div className="text-sm text-white/80 mt-1">Concorra ao vale-presente e ajude a atingir o milhão</div>
                </div>
              </div>


              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={DONATE_URL}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-mint px-6 py-3.5 font-bold text-navy-deep shadow-glow hover:scale-[1.03] transition-transform"
                >
                  <Heart className="size-5" /> Doar e concorrer
                </a>
                <ShareMenu />
              </div>
              <p className="mt-4 text-xs text-white/60">
                * Promoção válida somente durante o mês de julho. O sorteio é um incentivo — o
                que realmente importa é chegarmos juntos à marca histórica de R$ 1.000.000.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ShareMenu() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const links = useMemo(
    () => ({
      whatsapp: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`,
    }),
    []
  );

  const copy = async () => {
    await navigator.clipboard.writeText(SHARE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border-2 border-navy-deep px-6 py-3 font-bold text-navy-deep hover:bg-navy-deep hover:text-white transition-colors"
      >
        <Share2 className="size-5" /> Compartilhar a campanha
      </button>
      {open && (
        <div className="absolute z-20 left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl bg-white border border-border shadow-elegant p-2 animate-in fade-in zoom-in-95">
          <a
            href={links.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-medium text-foreground"
          >
            <span className="size-8 rounded-full bg-[#25D366] grid place-items-center text-white text-xs font-bold">
              W
            </span>
            WhatsApp
          </a>
          <a
            href={links.facebook}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-medium text-foreground"
          >
            <Facebook className="size-8 p-1.5 rounded-full bg-[#1877F2] text-white" />
            Facebook
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-medium text-foreground"
          >
            <Linkedin className="size-8 p-1.5 rounded-full bg-[#0A66C2] text-white" />
            LinkedIn
          </a>
          <button
            onClick={copy}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-sm font-medium text-foreground"
          >
            {copied ? (
              <Check className="size-8 p-1.5 rounded-full bg-mint text-navy-deep" />
            ) : (
              <Copy className="size-8 p-1.5 rounded-full bg-muted text-foreground" />
            )}
            {copied ? "Link copiado!" : "Copiar link"}
          </button>
        </div>
      )}
    </div>
  );
}

function ShareButtons() {
  const [copied, setCopied] = useState(false);

  const links = useMemo(
    () => ({
      whatsapp: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`,
    }),
    []
  );

  const copy = async () => {
    await navigator.clipboard.writeText(SHARE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-bold text-white shadow-elegant hover:scale-[1.03] active:scale-[0.98] transition-transform"
      >
        <MessageCircle className="size-5" /> WhatsApp
      </a>
      <a
        href={links.facebook}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-5 py-3 font-bold text-white shadow-elegant hover:scale-[1.03] active:scale-[0.98] transition-transform"
      >
        <Facebook className="size-5" /> Facebook
      </a>
      <a
        href={links.linkedin}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#0A66C2] px-5 py-3 font-bold text-white shadow-elegant hover:scale-[1.03] active:scale-[0.98] transition-transform"
      >
        <Linkedin className="size-5" /> LinkedIn
      </a>
      <button
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full border-2 border-navy-deep px-5 py-3 font-bold text-navy-deep hover:bg-navy-deep hover:text-white transition-colors"
      >
        {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
        {copied ? "Link copiado!" : "Copiar link"}
      </button>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-3xl bg-white border border-border p-6 shadow-elegant hover:-translate-y-1 transition-transform">
      <div className="size-12 rounded-2xl bg-gradient-mint grid place-items-center mb-4">
        <Icon className="size-6 text-navy-deep" />
      </div>
      <div className="font-display font-black text-3xl sm:text-4xl text-navy-deep tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

function Impact({ stats }: { stats: CampaignStats | null }) {
  const raised = useCountUp(stats?.raised ?? 0);
  const donors = useCountUp(stats?.donors ?? 0, 1400);
  const orgs = useCountUp(stats?.organizations ?? 0, 1400);

  return (
    <section className="py-20 sm:py-28 bg-muted/50">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block rounded-full bg-mint/20 px-3 py-1 text-xs font-bold text-navy-deep uppercase tracking-widest">
              O impacto da Leolam
            </span>
            <h2 className="mt-4 font-display font-black text-3xl sm:text-5xl text-navy-deep text-balance">
              Números que representam{" "}
              <span className="text-mint-dark">vidas transformadas</span>.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Reveal>
            <StatCard
              value={stats ? brl(raised) : "—"}
              label="Arrecadados pela comunidade"
              icon={TrendingUp}
            />
          </Reveal>
          <Reveal delay={100}>
            <StatCard value={stats ? `+${donors}` : "—"} label="Doadores" icon={Users} />
          </Reveal>
          <Reveal delay={200}>
            <StatCard
              value={stats ? `+${orgs}` : "—"}
              label="Organizações apoiadas"
              icon={Building2}
            />
          </Reveal>
        </div>

        {/* Timeline */}
        <Reveal>
          <h3 className="mt-20 font-display font-black text-2xl sm:text-3xl text-navy-deep text-center">
            Nossa jornada até aqui
          </h3>
        </Reveal>
        <div className="mt-10 relative">
          <div className="hidden lg:block absolute left-0 right-0 top-6 h-0.5 bg-gradient-to-r from-mint via-mint-dark to-navy/30" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {milestones.map((m, i) => (
              <Reveal key={m.year} delay={i * 80}>
                <div className="relative">
                  <div className="size-12 rounded-full bg-gradient-mint grid place-items-center font-display font-black text-navy-deep shadow-glow mx-auto lg:mx-0">
                    {i + 1}
                  </div>
                  <div className="mt-4 text-center lg:text-left">
                    <div className="text-[11px] sm:text-xs font-bold text-mint-dark tracking-wide">
                      {m.year}
                    </div>
                    <div className="mt-1 font-display font-bold text-base sm:text-lg text-navy-deep leading-tight">
                      {m.title}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Carousel */}
        <Reveal>
          <h3 className="mt-20 font-display font-black text-2xl sm:text-3xl text-navy-deep text-center">
            Organizações participantes
          </h3>
        </Reveal>
        <div className="mt-8 -mx-5 px-5 overflow-x-auto snap-x snap-mandatory scrollbar-none">
          <div className="flex gap-4 pb-4">
            {organizations.map((o) => (
              <div
                key={o.name}
                className="snap-start shrink-0 w-56 rounded-3xl bg-white border border-border shadow-elegant p-6 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 transition-transform"
              >
                <div className="w-full aspect-square rounded-2xl bg-muted/50 grid place-items-center overflow-hidden p-3">
                  <img
                    src={o.logo}
                    alt={`Logo ${o.name}`}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="font-display font-bold text-base text-navy-deep text-center leading-tight">
                  {o.name}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Reveal delay={100}>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Estas são apenas algumas das{" "}
            <span className="font-bold text-navy-deep">+45 organizações</span> que a Leolam
            apoja.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Community() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-hero text-white relative overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 -right-32 size-96 rounded-full bg-mint/20 blur-3xl" />
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block rounded-full border border-mint/40 bg-white/5 px-3 py-1 text-xs font-bold text-mint uppercase tracking-widest">
              Construído por muitos
            </span>
            <h2 className="mt-4 font-display font-black text-3xl sm:text-5xl text-balance">
              Ninguém chega a <span className="text-mint">R$ 1.000.000</span> sozinho.
            </h2>
            <p className="mt-5 text-white/80 text-base sm:text-lg">
              Cada doação representa uma pessoa que decidiu fortalecer a comunidade judaica
              brasileira. A Leolam só chegou até aqui graças à confiança de centenas de
              doadores e dezenas de organizações sociais.
            </p>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-10 font-display font-bold text-lg text-white text-center">
            Compartilhe a Missão 1 Milhão
          </p>
          <p className="mt-2 text-sm text-white/70 text-center">
            Quanto mais pessoas participarem, mais rápido chegamos ao primeiro milhão.
          </p>
          <div className="mt-6">
            <ShareButtons />
          </div>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-8 flex justify-center">
            <a
              href={DONATE_URL}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-mint px-8 py-5 text-lg font-bold text-navy-deep shadow-glow hover:scale-[1.03] active:scale-[0.98] transition-transform"
            >
              DOAR AGORA
              <ArrowRight className="size-5" />
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}


function Footer() {
  return (
    <footer className="bg-navy-deep text-white/80 py-12">
      <div className="mx-auto max-w-6xl px-5 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="font-display font-black text-2xl text-mint">leolam</div>
          <p className="mt-2 text-sm text-white/60 max-w-xs">
            ninguém é completo sozinho.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase font-bold tracking-widest text-mint mb-3">
            Leolam
          </div>
          <ul className="space-y-2 text-sm">
            <li><a href="https://leolam.com.br" className="hover:text-mint">Site oficial</a></li>
            <li><a href="https://leolam.com.br/sobre" className="hover:text-mint">Sobre</a></li>
            <li><a href="https://leolam.com.br/organizacoes" className="hover:text-mint">Organizações</a></li>
            <li><a href="https://leolam.com.br/politica-de-privacidade" className="hover:text-mint">Política de Privacidade</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase font-bold tracking-widest text-mint mb-3">
            Redes sociais
          </div>
          <div className="flex gap-3">
            <a href="https://instagram.com/leolam" aria-label="Instagram" className="size-10 rounded-full bg-white/10 hover:bg-mint hover:text-navy-deep grid place-items-center transition-colors">
              <Instagram className="size-5" />
            </a>
            <a href="https://facebook.com/leolam" aria-label="Facebook" className="size-10 rounded-full bg-white/10 hover:bg-mint hover:text-navy-deep grid place-items-center transition-colors">
              <Facebook className="size-5" />
            </a>
            <a href="https://linkedin.com/company/leolam" aria-label="LinkedIn" className="size-10 rounded-full bg-white/10 hover:bg-mint hover:text-navy-deep grid place-items-center transition-colors">
              <Linkedin className="size-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-white/10 mx-auto max-w-6xl px-5 text-xs text-white/50">
        © {new Date().getFullYear()} Leolam · Missão 1 Milhão
      </div>
    </footer>
  );
}
