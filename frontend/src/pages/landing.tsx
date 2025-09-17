import { ArrowRight, PlayCircle } from "@untitledui/icons";
import { motion } from "motion/react";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Button } from "@/components/base/buttons/button";
import { Avatar } from "@/components/base/avatar/avatar";
import { Header } from "@/components/marketing/header-navigation/header";
import { BannerTextFieldDefault } from "@/components/marketing/banners/banner-text-field-default";
import { ContactSimpleIcons02 } from "@/components/marketing/contact/contact-simple-icons-02";
import { ContentSectionSplitImage02 } from "@/components/marketing/content/content-section-split-image-02";
import { CTAAbstractImagesBrand } from "@/components/marketing/cta/cta-abstract-images-brand";
import { FAQAccordion01Brand } from "@/components/marketing/faq/faq-accordion-01-brand";
import { FeaturesSimpleIcons02Brand } from "@/components/marketing/features/features-simple-icons-02-brand";
import { MetricsCardGrayLight } from "@/components/marketing/metrics/metrics-card-gray-light";
import { NewsletterIPhoneMockup01 } from "@/components/marketing/newsletter-cta/newsletter-iphone-mockup-01";
import { PricingPrimaryDarkBadge } from "@/components/marketing/pricing-sections/pricing-primary-dark-badge";
import { SocialProofCardBrand } from "@/components/marketing/social-proof/social-proof-card-brand";
import { FooterLarge13Brand } from "@/components/marketing/footers/footer-large-13-brand";

const HeaderPrimary = () => {
    return (
        <Header className="bg-utility-brand-50_alt [&_nav>ul>li>a]:text-brand-primary [&_nav>ul>li>a]:hover:text-brand-primary [&_nav>ul>li>button]:text-brand-primary [&_nav>ul>li>button]:hover:text-brand-primary [&_nav>ul>li>button>svg]:text-fg-brand-secondary_alt" />
    );
};

const HeroSection = () => {
    return (
        <section>
            <div className="flex flex-col items-center bg-utility-brand-50_alt pt-16 md:pt-24">
                <div className="mx-auto flex w-full max-w-container flex-col px-4 md:px-8">
                    <div className="flex flex-col items-start sm:items-center sm:text-center">
                        <motion.a
                            href="#"
                            className="rounded-full outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            <BadgeGroup className="hidden md:flex" size="lg" addonText="New feature" iconTrailing={ArrowRight} theme="light" color="brand">
                                Discover our latest innovation
                            </BadgeGroup>
                            <BadgeGroup className="md:hidden" size="md" addonText="New feature" iconTrailing={ArrowRight} theme="light" color="brand">
                                Discover our latest innovation
                            </BadgeGroup>
                        </motion.a>

                        <motion.h1
                            className="mt-4 text-display-md font-semibold text-brand-primary md:text-display-lg lg:text-display-xl"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        >
                            Revolutionize Your Workflow. <br /> Build Something Amazing.
                        </motion.h1>
                        <motion.p
                            className="mt-4 max-w-3xl text-lg text-brand-secondary md:mt-6 md:text-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        >
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                        </motion.p>
                        <motion.div
                            className="relative z-1 mt-8 flex w-full flex-col-reverse items-stretch gap-3 sm:w-auto sm:flex-row sm:items-start md:mt-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Button iconLeading={PlayCircle} color="secondary" size="xl">
                                    Watch Demo
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="animate-pulse"
                                style={{ 
                                    animationDelay: "2s",
                                    animationDuration: "3s",
                                    animationIterationCount: "3"
                                }}
                            >
                                <Button size="xl">Get Started</Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <motion.div
                className="relative pt-16 pb-16 bg-utility-brand-50_alt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            >
                <div className="mx-auto max-w-container px-4 md:px-8">
                    <div className="relative mx-auto w-full max-w-4xl">
                        <motion.div 
                            className="aspect-video w-full rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary shadow-2xl"
                            animate={{ 
                                y: [0, -10, 0],
                                boxShadow: [
                                    "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                    "0 35px 60px -12px rgba(0, 0, 0, 0.35)",
                                    "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                                ]
                            }}
                            transition={{ 
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 2
                            }}
                            whileHover={{ 
                                scale: 1.02,
                                transition: { duration: 0.3 }
                            }}
                        >
                            <div className="flex h-full items-center justify-center">
                                <motion.div
                                    className="text-center text-white"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 1.2 }}
                                >
                                    <motion.div
                                        whileHover={{ 
                                            scale: 1.1,
                                            rotate: 5,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <PlayCircle className="mx-auto mb-4 size-16 opacity-80" />
                                    </motion.div>
                                    <p className="text-lg font-medium">Product Demo Video</p>
                                    <p className="text-sm opacity-75">Click to play</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

const AboutSection = () => {
    return (
        <section className="py-16 md:py-24 bg-primary">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <motion.div
                    className="mx-auto max-w-3xl text-center"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="text-sm font-semibold text-brand-primary md:text-md">About Us</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">
                        Trusted by thousands of companies
                    </h2>
                    <p className="mt-4 text-lg text-secondary md:mt-5 md:text-xl">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    </p>
                </motion.div>
                
                <div className="mt-12 md:mt-16">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {[
                            { number: "10K+", label: "Active Users" },
                            { number: "50+", label: "Countries" },
                            { number: "99.9%", label: "Uptime" },
                            { number: "24/7", label: "Support" },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                className="text-center"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ 
                                    duration: 0.6, 
                                    delay: index * 0.1,
                                    ease: "easeOut" 
                                }}
                            >
                                <motion.div
                                    className="text-display-sm font-semibold text-brand-primary md:text-display-md"
                                    initial={{ scale: 0.8 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ 
                                        duration: 0.5, 
                                        delay: index * 0.1 + 0.2,
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20
                                    }}
                                >
                                    {stat.number}
                                </motion.div>
                                <div className="mt-1 text-md text-secondary md:text-lg">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const TestimonialsSection = () => {
    return (
        <section className="py-16 md:py-24 bg-secondary">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <motion.div
                    className="mx-auto max-w-3xl text-center"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="text-sm font-semibold text-brand-primary md:text-md">Testimonials</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">
                        What our customers say
                    </h2>
                </motion.div>
                
                <div className="mt-12 md:mt-16">
                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                                author: "Sarah Johnson",
                                title: "CEO, TechCorp",
                                initials: "SJ",
                            },
                            {
                                quote: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                                author: "Michael Chen",
                                title: "CTO, InnovateNow",
                                initials: "MC",
                            },
                            {
                                quote: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                                author: "Emily Rodriguez",
                                title: "Product Manager, StartupXYZ",
                                initials: "ER",
                            },
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="rounded-xl bg-primary p-6 shadow-sm"
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ 
                                    duration: 0.6, 
                                    delay: index * 0.15,
                                    ease: "easeOut" 
                                }}
                                whileHover={{ 
                                    y: -8,
                                    transition: { duration: 0.2, ease: "easeOut" }
                                }}
                            >
                                <motion.p
                                    className="text-md text-secondary italic"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ 
                                        duration: 0.6, 
                                        delay: index * 0.15 + 0.2 
                                    }}
                                >
                                    "{testimonial.quote}"
                                </motion.p>
                                <motion.div
                                    className="mt-4 flex items-center gap-3"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ 
                                        duration: 0.5, 
                                        delay: index * 0.15 + 0.4 
                                    }}
                                >
                                    <Avatar 
                                        size="md" 
                                        initials={testimonial.initials}
                                        alt={testimonial.author}
                                    />
                                    <div>
                                        <div className="text-sm font-semibold text-primary">
                                            {testimonial.author}
                                        </div>
                                        <div className="text-sm text-tertiary">
                                            {testimonial.title}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const CTASection = () => {
    return (
        <section className="py-16 md:py-24 bg-primary">
            <div className="mx-auto max-w-container px-4 md:px-8">
                <motion.div
                    className="mx-auto max-w-3xl text-center"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.h2
                        className="text-display-sm font-semibold text-primary md:text-display-md"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                            duration: 0.6, 
                            delay: 0.2,
                            type: "spring",
                            stiffness: 200,
                            damping: 20
                        }}
                    >
                        Ready to get started?
                    </motion.h2>
                    <motion.p
                        className="mt-4 text-lg text-secondary md:text-xl"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </motion.p>
                    <motion.div
                        className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:mt-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Button iconLeading={PlayCircle} color="secondary" size="xl">
                                Schedule a Demo
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Button size="xl">Start Free Trial</Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export const Landing = () => {
    const sections = [
        { component: BannerTextFieldDefault, delay: 0 },
        { component: HeaderPrimary, delay: 0.1 },
        { component: HeroSection, delay: 0 },
        { component: SocialProofCardBrand, delay: 0.2 },
        { component: AboutSection, delay: 0 },
        { component: MetricsCardGrayLight, delay: 0.3 },
        { component: FeaturesSimpleIcons02Brand, delay: 0.4 },
        { component: ContentSectionSplitImage02, delay: 0.5 },
        { component: PricingPrimaryDarkBadge, delay: 0.6 },
        { component: TestimonialsSection, delay: 0 },
        { component: FAQAccordion01Brand, delay: 0.7 },
        { component: NewsletterIPhoneMockup01, delay: 0.8 },
        { component: ContactSimpleIcons02, delay: 0.9 },
        { component: CTAAbstractImagesBrand, delay: 1.0 },
        { component: CTASection, delay: 0 },
        { component: FooterLarge13Brand, delay: 1.1 },
    ];

    return (
        <motion.div 
            className="bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {sections.map((section, index) => {
                const Component = section.component;
                
                // Don't animate hero section and custom sections as they have their own animations
                if (Component === HeroSection || Component === AboutSection || Component === TestimonialsSection || Component === CTASection) {
                    return <Component key={index} />;
                }

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ 
                            duration: 0.8, 
                            delay: section.delay * 0.1,
                            ease: "easeOut" 
                        }}
                    >
                        <Component />
                    </motion.div>
                );
            })}
        </motion.div>
    );
};