import { PlayCircle } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { IPhoneMockup } from "@/components/shared-assets/iphone-mockup";

const trustLogos = [
    {
        alt: "Meridian Quant",
        src: "https://www.untitledui.com/logos/logotype/white/catalog.svg",
    },
    {
        alt: "Northwind Capital",
        src: "https://www.untitledui.com/logos/logotype/white/pictelai.svg",
    },
    {
        alt: "Helios Macro",
        src: "https://www.untitledui.com/logos/logotype/white/leapyear.svg",
    },
    {
        alt: "Summit Digital",
        src: "https://www.untitledui.com/logos/logotype/white/peregrin.svg",
    },
    {
        alt: "Atlas Family Office",
        src: "https://www.untitledui.com/logos/logotype/white/easytax.svg",
    },
];

export const FooterLarge13Brand = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-slate-900 text-white">
            <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-20">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                        <div className="relative flex aspect-[16/9] w-full items-center justify-center bg-black/20">
                            <IPhoneMockup
                                image="/images/Tech Trading Platform Logo - Apex, Wordmark Style.svg"
                                imageDark="/images/Tech Trading Platform Logo - Apex, Wordmark Style.svg"
                                className="w-full max-w-72 drop-shadow-iphone-mockup"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                                <p className="text-sm font-semibold uppercase tracking-wide text-white/70">In-platform execution mockup</p>
                                <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Apex automates entries, exits, and hedges in real time.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 text-left md:text-center lg:text-left">
                        <UntitledLogoMinimal className="h-16 w-auto" />
                        <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                            Deploy institutional automation across your entire book.
                        </h2>
                        <p className="text-lg text-white/80 md:text-xl">
                            Connect your brokerage, assign Apex AI portfolios or trusted traders, and let our orchestration engine compound gains while respecting your risk envelope.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                            <Button size="xl">Talk to our team</Button>
                            <Button size="xl" color="secondary" iconLeading={PlayCircle}>
                                Watch platform tour
                            </Button>
                        </div>
                        <div className="mt-10 space-y-4">
                            <p className="text-sm font-medium uppercase tracking-wide text-white/60">
                                Trusted by allocators from leading funds
                            </p>
                            <div className="flex flex-wrap items-center gap-6 opacity-90">
                                {trustLogos.map(({ alt, src }) => (
                                    <img key={alt} alt={alt} src={src} loading="lazy" className="h-10 w-auto" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col-reverse justify-between gap-4 border-t border-white/10 pt-8 text-sm text-white/60 md:mt-16 md:flex-row md:items-center md:gap-6">
                    <p>� {year} Apex Trading. All rights reserved.</p>
                    <ul className="flex flex-wrap gap-4 md:justify-end">
                        {[
                            { label: "Terms", href: "#" },
                            { label: "Privacy", href: "#" },
                            { label: "Security", href: "#" },
                        ].map(({ label, href }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    className="rounded-xs transition duration-100 ease-linear hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40 focus-visible:ring-offset-slate-900"
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
};
