import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    ArrowRight,
    BarChartSquare02,
    BookOpen01,
    CheckCircle,
    Globe02,
    PlayCircle,
    Shield01,
    ShieldTick,
    Stars02,
    Wallet02,
} from "@untitledui/icons";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Header } from "@/components/marketing/header-navigation/header";
import { FeatureTextFeaturedIconTopCenteredBrand } from "@/components/marketing/features/base-components/feature-text";
import { SlideoutMenu } from "@/components/application/slideout-menus/slideout-menu";
import { FooterLarge13Brand } from "@/components/marketing/footers/footer-large-13-brand";
import { CryptoBadge } from "../components/base/badges/crypto-badge";
import TradingViewWidget from "../components/trading-view-widget";

const HERO_VIDEO_SRC = "/images/better-performance-illustration-video.mp4";
const MARKETPLACE_VIDEO_SRC = "/images/Apex-footer-video.mp4";
const SMART_VISUALIZER_SRC = "/images/smart-trading-visualizer.mp4";
const WIDGETS_MAIN_VIDEO_SRC = "/images/widgets-main-video.hvc1.3010a527240f8051d301.mp4";

const heroStats = [
    { label: "AUM orchestrated", value: "$2.4B" },
    { label: "Execution latency", value: "46 ms" },
    { label: "Accounts trading", value: "12,500+" },
    { label: "Daily decisions", value: "3.2M" },
];

const featureItems = [
    {
        title: "Neural execution engine",
        subtitle: "Blend Apex AI with deterministic risk guardrails to optimise entries, exits, and hedges across every connected venue.",
        icon: Stars02,
    },
    {
        title: "Institutional guardrails",
        subtitle: "Layered VaR controls, per-asset exposure caps, and circuit breakers keep every portfolio inside mandate.",
        icon: ShieldTick,
    },
    {
        title: "Live strategist marketplace",
        subtitle: "Mirror regulated desks, commodity specialists, and quant teams with allocation limits tied to your policy.",
        icon: Globe02,
    },
    {
        title: "Capital-aware tasking",
        subtitle: "Auto-net funding, route to best venues, and rebalance collateral in real time with Apex treasury automation.",
        icon: Wallet02,
    },
    {
        title: "Performance intelligence",
        subtitle: "Surface trend pivots, drawdown drivers, and desk attribution with intraday dashboards and programmable alerts.",
        icon: BarChartSquare02,
    },
    {
        title: "Compliance autodocs",
        subtitle: "Export KYC, trade blotter, and audit-ready narratives synchronised with every execution decision.",
        icon: Shield01,
    },
];

const strategyPlaybook = [
    {
        name: "Apex AI Momentum",
        description: "Cross-asset momentum engine with adaptive leverage, rebalanced hourly across FX, indices, and BTC options.",
        apr: "+18.7% YTD",
        risk: "Risk band: Moderate",
    },
    {
        name: "Macro Volatility Overlay",
        description: "Delta-hedged volatility harvesting overlay that stabilises equity drawdowns with CME micro futures and FX hedges.",
        apr: "+9.3% YTD",
        risk: "Risk band: Conservative",
    },
    {
        name: "Quant Copy: Meridian Desk",
        description: "Regulated systematic desk publishing trade-by-trade transparency with single-click allocation controls.",
        apr: "+22.1% YTD",
        risk: "Risk band: Growth",
    },
];

const metrics = [
    { label: "Capital deployed via Apex", value: "$2.4B" },
    { label: "Average strategy uplift", value: "+11.2% monthly" },
    { label: "Desk response time", value: "< 60 seconds" },
];

const partnerLogos = [
    "Meridian Quant",
    "Summit Digital",
    "Northwind Capital",
    "Helios Macro",
    "Atlas Family Office",
];

// Removed legacy `testimonials` array; testimonials are now generated dynamically below.

const faqs = [
    {
        question: "How are Apex strategists vetted?",
        answer:
            "Every strategist completes diligence covering audited performance, drawdown discipline, and regulatory standing. Live mandates are monitored with automated pause rules tied to your policy.",
    },
    {
        question: "Does Apex take custody of client capital?",
        answer:
            "No. You can fund your Apex wallet with cryptocurrency to begin algorithmic trading. Apex instructs executions and manages risk while you retain custody and can revoke access at any time.",
    },
    {
        question: "Can we embed Apex data into our dashboards?",
        answer:
            "Yes. Stream trade blotters, risk telemetry, and performance metrics via webhooks or scheduled exports mapped to your entity and desk structure.",
    },
];

const pricingTiers = [
    {
        name: "Starter",
        price: "$49/mo",
        finePrint: "+ 15% performance fee on realised gains",
        description: "Perfect for new investors starting with algorithmic trading",
        features: [
            "Up to $50K tracked capital",
            "3 Apex AI portfolios included",
            "Follow 2 institutional traders",
            "Daily risk reports and mobile alerts",
        ],
    },
    {
        name: "Professional",
        price: "$199/mo",
        finePrint: "+ 12% performance fee on realised gains",
        description: "Advanced features for serious investors scaling their portfolio",
        featured: true,
        features: [
            "Up to $500K tracked capital",
            "Unlimited Apex AI portfolios",
            "Copy up to 10 desks simultaneously",
            "Intraday guardrails",
            "Dedicated success manager",
        ],
    },
    {
        name: "Enterprise",
        price: "Custom",
        finePrint: "2% management + 15% performance fee",
        description: "Custom solutions for high-net-worth individuals and institutions",
        features: [
            "Unlimited capital & entity support",
            "Custom signal research pods",
            "Direct market access & co-location",
            "Compliance-ready audit exports",
            "24/5 trading desk with SLAs",
        ],
    },
];

const HeroSection = () => {
    return (
        <section className="relative">
            {/* Background image with blur */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/images/videoframe_943.png')",
                    filter: "blur(30px)",
                    transform: "scale(1.1)"
                }}
            />
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-primary/80" />
            
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-20 pt-20 text-primary md:px-8 md:pt-24 lg:flex-row lg:items-center">
                <div className="flex-1 space-y-8">
                    <BadgeGroup size="lg" color="brand" theme="light" addonText="Live since 2016" iconTrailing={ArrowRight}>
                        Pro-grade automation for allocators
                    </BadgeGroup>
                    <h1 className="text-balance text-4xl font-semibold leading-tight text-primary md:text-5xl lg:text-6xl">
                        Institutional AI trading for investors who demand more than buy-and-hold.
                    </h1>
                    <p className="text-lg text-tertiary md:text-xl">
                        Connect your brokerages, assign Apex AI engines or regulated strategists, and let our orchestration layer rebalance, hedge, and report with total transparency.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button size="xl" href="/signup">
                            Start free trial
                        </Button>
                        <SlideoutMenu.Trigger>
                            <Button size="xl" color="secondary" iconLeading={PlayCircle}>
                                Browse strategy library
                            </Button>
                            <SlideoutMenu className="cursor-auto" dialogClassName="bg-primary text-primary max-w-100">
                                {({ close }) => (
                                    <>
                                        <SlideoutMenu.Header onClose={close} className="space-y-3">
                                            <span className="text-sm font-semibold text-tertiary">Strategy playbook</span>
                                            <h2 className="text-2xl font-semibold text-primary">Preview Apex-managed mandates</h2>
                                            <p className="text-sm text-tertiary">
                                                Compare objectives, historical performance, and guardrails before allocating. Assign any strategy to simulated or live accounts instantly.
                                            </p>
                                        </SlideoutMenu.Header>
                                        <SlideoutMenu.Content className="gap-5 pb-6">
                                            {strategyPlaybook.map((strategy) => (
                                                <div key={strategy.name} className="flex flex-col gap-3 rounded-2xl border border-secondary bg-secondary p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-1">
                                                            <p className="text-md font-semibold text-primary">{strategy.name}</p>
                                                            <p className="text-sm text-tertiary">{strategy.description}</p>
                                                        </div>
                                                        <span className="rounded-full bg-brand-solid/10 px-3 py-1 text-xs font-semibold text-brand-solid">
                                                            {strategy.apr}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-tertiary">
                                                        <span>{strategy.risk}</span>
                                                        <Button size="sm" color="secondary" href="/signup">
                                                            Allocate
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </SlideoutMenu.Content>
                                        <SlideoutMenu.Footer className="flex flex-col gap-3">
                                            <Button size="lg" href="/signup">
                                                Open Apex account
                                            </Button>
                                            <Button size="lg" color="secondary" href="mailto:sales@apextrades.com">
                                                Talk to our team
                                            </Button>
                                        </SlideoutMenu.Footer>
                                    </>
                                )}
                            </SlideoutMenu>
                        </SlideoutMenu.Trigger>
                    </div>
                    <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {heroStats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-secondary bg-secondary p-4">
                                <dd className="text-2xl font-semibold text-primary md:text-3xl">{stat.value}</dd>
                                <dt className="mt-1 text-xs font-semibold uppercase tracking-wide text-tertiary">{stat.label}</dt>
                            </div>
                        ))}
                    </dl>
                </div>
                <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="overflow-hidden rounded-3xl border border-secondary bg-secondary shadow-2xl">
                        <video className="h-full w-full object-cover" autoPlay loop muted playsInline src={HERO_VIDEO_SRC}>
                            <source src={HERO_VIDEO_SRC} type="video/mp4" />
                        </video>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const FullWidthVideoSection = () => {
    return (
        <section className="w-full bg-primary">
            <div className="w-full">
                <video 
                    className="w-full h-auto max-h-[80vh] object-cover"
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    src={WIDGETS_MAIN_VIDEO_SRC}
                >
                    <source src={WIDGETS_MAIN_VIDEO_SRC} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </section>
    );
};



const PartnersSection = () => {
    return (
        <section className="bg-secondary py-12">
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 text-center text-tertiary md:px-8">
                <p className="text-sm font-semibold uppercase tracking-wide">Trusted by allocators across three continents</p>
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm md:text-base">
                    {partnerLogos.map((logo) => (
                        <span key={logo} className="rounded-full bg-primary px-4 py-2 text-tertiary">
                            {logo}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FeatureHighlights = () => {
    return (
        <section id="features" className="bg-brand-section py-16 md:py-24">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                    <span className="text-sm font-semibold text-secondary_on-brand">Capabilities</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary_on-brand md:text-display-md">
                        Everything you need to compound with confidence
                    </h2>
                    <p className="mt-4 text-lg text-tertiary_on-brand md:mt-5 md:text-xl">
                        Apex Trades unifies autonomous execution, regulated strategists, and compliance automation so you can deploy capital at institutional speed.
                    </p>
                </div>
                <ul className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {featureItems.map(({ title, subtitle, icon }) => (
                        <li key={title}>
                            <FeatureTextFeaturedIconTopCenteredBrand title={title} subtitle={subtitle} icon={icon} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

const CopyTradingShowcase = () => {
    return (
        <section id="about" className="bg-surface-primary py-20">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 text-primary md:flex-row md:px-8">
                <div className="flex-1 space-y-6">
                    <BadgeGroup size="md" color="brand" theme="light" addonText="Marketplace" iconTrailing={BookOpen01}>
                        Apex Copy Trading Network
                    </BadgeGroup>
                    <h2 className="text-3xl font-semibold md:text-4xl">Follow regulated proprietary traders with complete transparency.</h2>
                    <p className="text-lg text-tertiary">
                        Allocate across discretionary and systematic desks with audited records, per-strategy guardrails, and instant pause controls. Apex normalises risk and reporting so every allocation stays within mandate.
                    </p>
                    <ul className="space-y-3 text-base text-tertiary">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="mt-1 h-5 w-5 text-brand-primary" /> On-chain performance proofs, ticket-level commentary, and daily reconciliations.
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="mt-1 h-5 w-5 text-brand-primary" /> Adjustable drawdown guardrails with automated reallocation on breach.
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="mt-1 h-5 w-5 text-brand-primary" /> Weekly outlook streams and shared playbooks from every strategist you follow.
                        </li>
                    </ul>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button size="lg" color="secondary" href="/signup">
                            Browse live mandates
                        </Button>
                        <Button size="lg" href="/login">
                            Log in to console
                        </Button>
                    </div>
                </div>
                <div className="flex-1 space-y-6">
                    <div className="overflow-hidden rounded-3xl border border-secondary bg-secondary shadow-2xl">
                        <video className="h-full w-full object-cover" autoPlay loop muted playsInline src={MARKETPLACE_VIDEO_SRC}>
                            <source src={MARKETPLACE_VIDEO_SRC} type="video/mp4" />
                        </video>
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-secondary bg-secondary shadow-2xl">
                        <video className="h-full w-full object-cover" autoPlay loop muted playsInline src={SMART_VISUALIZER_SRC}>
                            <source src={SMART_VISUALIZER_SRC} type="video/mp4" />
                        </video>
                    </div>
                </div>
            </div>
        </section>
    );
};

const MetricsSection = () => {
    return (
        <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto flex w-full max-w-container flex-col gap-12 rounded-[32px] border border-secondary bg-secondary px-6 py-12 text-primary md:px-12">
                <div className="flex flex-col gap-4 text-center md:text-left">
                    <span className="text-sm font-semibold uppercase tracking-wide text-tertiary">Performance telemetry</span>
                    <h2 className="text-display-sm font-semibold text-primary md:text-display-md">
                        Real-time insight for risk, execution, and growth teams
                    </h2>
                    <p className="text-lg text-tertiary md:text-xl">
                        Stream dashboards or export data into your own stack. Apex keeps every desk aligned on risk, capital efficiency, and attribution.
                    </p>
                </div>
                <dl className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="rounded-2xl border border-secondary bg-primary p-6 text-center md:text-left">
                            <dd className="text-display-sm font-semibold text-primary md:text-display-md">{metric.value}</dd>
                            <dt className="mt-2 text-sm font-semibold uppercase tracking-wide text-tertiary">{metric.label}</dt>
                        </div>
                    ))}
                </dl>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-tertiary">
                        Need metrics pushed into your BI tooling? Schedule a walkthrough with our integrations team.
                    </p>
                    <Button size="lg" color="secondary" href="mailto:integrations@apextrades.com">
                        Request data spec
                    </Button>
                </div>
            </div>
        </section>
    );
};

const PricingSection = () => {
    return (
        <section id="pricing" className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-6xl px-4 md:px-8">
                <div className="mx-auto max-w-3xl text-center space-y-4">
                    <BadgeGroup size="md" color="brand" theme="light" addonText="Transparent fees" iconTrailing={ArrowRight}>
                        Pricing & packages
                    </BadgeGroup>
                    <h2 className="text-balance text-3xl font-semibold text-primary md:text-4xl">
                        Choose a plan aligned with your mandate
                    </h2>
                    <p className="text-lg text-tertiary md:text-xl">
                        Start with Explorer, scale into Pro as allocations grow, or partner with us for bespoke institutional workflows.
                    </p>
                </div>
                <div className="text-center mb-8">
                    <h3 className="text-lg font-semibold">Get Started in Minutes</h3>
                    <p className="text-gray-600 mt-2">
                        Fund your Apex wallet with cryptocurrency to begin algorithmic trading. 
                        We use crypto settlements for instant allocation and global accessibility, 
                        ensuring your capital is deployed within minutes instead of days.
                    </p>
                </div>
                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {pricingTiers.map(({ name, price, finePrint, description, features, featured }) => (
                        <div
                            key={name}
                            className={`flex h-full flex-col gap-6 rounded-3xl border p-8 shadow-sm ${
                                featured ? "border-brand-solid bg-brand-solid/5" : "border-secondary bg-secondary"
                            }`}
                        >
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold text-tertiary">{featured ? "Most popular" : "Specialist tier"}</p>
                                <h3 className="text-2xl font-semibold text-primary">{name}</h3>
                                <p className="text-3xl font-semibold text-primary">{price}</p>
                                <p className="text-sm text-tertiary">{finePrint}</p>
                                <p className="text-base text-tertiary">{description}</p>
                            </div>
                            <ul className="space-y-3 text-sm text-tertiary">
                                {features
                                    .filter((item) => {
                                        const lower = item.toLowerCase();
                                        return !(
                                            lower.includes("api") ||
                                            lower.includes("brokerage") ||
                                            lower.includes("3rd party") ||
                                            lower.includes("third party") ||
                                            lower.includes("external account") ||
                                            lower.includes("external account linking")
                                        );
                                    })
                                    .map((item) => (
                                        <li key={item} className="flex items-start gap-3">
                                            <CheckCircle className="mt-0.5 h-4 w-4 text-brand-primary" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                            </ul>
                            <div className="mt-auto flex flex-col gap-3">
                                <Button size="lg" color={featured ? "primary" : "secondary"} href="/signup">
                                    Launch with {name}
                                </Button>
                                <Button size="lg" color="tertiary" href="mailto:sales@apextrades.com">
                                    {name === "Enterprise" ? "Contact Sales" : "Get Started"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12 p-6 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold">Accepted Cryptocurrencies</h4>
                    <div className="flex justify-center gap-4 mt-3">
                        <CryptoBadge>BTC</CryptoBadge>
                        <CryptoBadge>ETH</CryptoBadge>
                        <CryptoBadge>USDT</CryptoBadge>
                        <CryptoBadge>USDC</CryptoBadge>
                    </div>
                    
                    <div className="mt-6 p-4 bg-yellow-50 rounded-md">
                        <p className="text-sm text-yellow-800">
                            <strong>Don't have cryptocurrency?</strong> Our support team can guide you 
                            through purchasing crypto or discuss alternative funding options.
                        </p>
                        <Button size="sm" color="secondary" className="mt-3">
                            Talk to Support
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const TestimonialsSection = () => {
    const avatars = useMemo(() => {
        const roles = [
            "Portfolio Manager",
            "Quant Strategist",
            "Risk Lead",
            "Head of Trading",
            "Investment Director",
            "CIO",
        ];
        const comments = [
            "Execution quality has been consistently top quartile across venues.",
            "Crypto-only settlement means we can deploy capital instantly on triggers.",
            "Guardrails kept the book inside mandate during stress scenarios.",
            "Attribution views are clear enough for our LP updates.",
            "Setup took under 48 hours including policy wiring.",
            "Copy strategies mirror desk intent without custody risk.",
            "Intraday rebalance removed our manual busywork.",
            "Latency improvements showed up in our slippage metrics.",
            "Risk pause rules fired precisely where expected.",
            "Mobile alerts mapped perfectly to our escalation tree.",
        ];
        return Array.from({ length: 50 }, (_, i) => {
            const id = (i % 70) + 1;
            const first = ["Alex", "Sam", "Jordan", "Taylor", "Riley", "Morgan", "Casey", "Avery", "Cameron", "Drew"][i % 10];
            const last = ["Chen", "Patel", "Garcia", "Nakamura", "Okoro", "Johansson", "Dubois", "Silva", "Hernández", "Ibrahim"][
                (i * 3) % 10
            ];
            return {
                name: `${first} ${last}`,
                title: roles[i % roles.length],
                quote: comments[i % comments.length],
                src: `https://i.pravatar.cc/128?img=${id}`,
            };
        });
    }, []);

    const [indices, setIndices] = useState<[number, number]>([0, 1]);

    useEffect(() => {
        const pickTwo = () => {
            const a = Math.floor(Math.random() * avatars.length);
            let b = Math.floor(Math.random() * avatars.length);
            if (b === a) b = (b + 1) % avatars.length;
            setIndices([a, b]);
        };
        const id = setInterval(pickTwo, 5000);
        return () => clearInterval(id);
    }, [avatars.length]);

    return (
        <section id="testimonials" className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-8">
                <h2 className="text-3xl font-semibold text-center text-primary md:text-4xl">Trusted by allocators on three continents.</h2>
                <div className="mt-12 grid gap-6 md:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                        {[0, 1].map((slot) => {
                            const idx = indices[slot];
                            const a = avatars[idx];
                            return (
                                <motion.div
                                    key={`${slot}-${idx}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    className="flex h-full flex-col gap-4 rounded-3xl border border-border-secondary bg-surface-primary p-8 shadow-sm"
                                >
                                    <p className="text-lg leading-relaxed text-secondary">&ldquo;{a.quote}&rdquo;</p>
                                    <div className="flex items-center gap-3">
                                        <Avatar size="sm" src={a.src} alt={a.name} initials={a.name.split(" ").map((w) => w[0]).join("").slice(0, 2)} />
                                        <div>
                                            <p className="font-semibold text-primary">{a.name}</p>
                                            <p className="text-sm text-secondary">{a.title}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};

const FAQSection = () => {
    return (
        <section id="faq" className="bg-primary py-16 md:py-24">
            <div className="mx-auto max-w-4xl px-4 md:px-8">
                <div className="flex flex-col gap-4 text-center">
                    <h2 className="text-3xl font-semibold text-primary md:text-4xl">Frequently asked questions</h2>
                    <p className="text-base text-tertiary">
                        Still evaluating? Our team can tailor migration plans, compliance packs, and risk documentation for your stakeholders.
                    </p>
                </div>
                <div className="mt-10 space-y-6">
                    {faqs.map(({ question, answer }) => (
                        <div key={question} className="rounded-2xl border border-border-secondary bg-surface-primary p-6">
                            <h3 className="text-xl font-semibold text-primary">{question}</h3>
                            <p className="mt-3 text-base leading-relaxed text-secondary">{answer}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-10 flex flex-col items-center gap-3">
                    <Button size="lg" href="mailto:support@apextrades.com">
                        Email support
                    </Button>
                    <Button size="lg" color="secondary" href="/login">
                        Log in to submit a ticket
                    </Button>
                </div>
            </div>
        </section>
    );
};

const CTASection = () => {
    return (
        <section id="contact" className="bg-gradient-to-r from-brand-primary via-brand-primary_alt to-brand-primary py-20 text-white">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center md:px-8">
                <h2 className="text-3xl font-semibold md:text-4xl">Deploy Apex Trades in under 48 hours.</h2>
                <p className="max-w-2xl text-lg text-white/90">
                    Our onboarding desk migrates existing strategies, configures guardrails, and trains your team on orchestration best practices. Connect capital, pick your strategists, and watch Apex execute.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button size="xl" color="secondary" href="/signup">
                        Open an account
                    </Button>
                    <Button size="xl" color="secondary" className="border border-white/40 bg-transparent text-white hover:bg-white/10" href="mailto:sales@apextrades.com">
                        Book a strategy session
                    </Button>
                </div>
            </div>
        </section>
    );
};

export const Landing = () => {
    return (
        <div className="bg-primary text-primary">
            <Header isFullWidth isSticky logoClassName="h-12 md:h-16" />
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes marquee {
                        0% { transform: translateX(0%); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                        animation: marquee 60s linear infinite;
                    }
                `
            }} />
            <main>
                {/* TradingView Widget between nav and hero */}
                <div className="bg-gray-900 py-2">
                    <div className="max-w-7xl mx-auto px-4">
                        <TradingViewWidget />
                    </div>
                </div>
                
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                    <HeroSection />
                </motion.div>
                
                {/* TradingView Widget above video section */}
                <div className="bg-gray-800 py-3">
                    <div className="max-w-7xl mx-auto px-4">
                        <TradingViewWidget />
                    </div>
                </div>
                
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.01 }}>
                    <FullWidthVideoSection />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}>
                    <PartnersSection />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}>
                    <FeatureHighlights />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}>
                    <CopyTradingShowcase />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}>
                    <MetricsSection />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}>
                    <PricingSection />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}>
                    <TestimonialsSection />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}>
                    <FAQSection />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}>
                    <CTASection />
                </motion.div>
            </main>
            <FooterLarge13Brand />
        </div>
    );
};
