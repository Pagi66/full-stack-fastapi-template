import type { FC, ReactNode } from "react";
import { ArrowRight, BookClosed, FileCode01, Flag04, Folder, MessageCircle01, PlayCircle, Stars02, Users01 } from "@untitledui/icons";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { NavMenuItemLink } from "./base-components/nav-menu-item";
import { VideoCardHorizontal } from "./base-components/nav-menu-item-card";

type MenuItem = {
    title: string;
    subtitle?: string;
    href: string;
    Icon: FC<{ className?: string }>;
    badge?: ReactNode;
};

type MenuColumn = {
    title: string;
    items: MenuItem[];
};

const columns: MenuColumn[] = [
    {
        title: "Resources",
        items: [
            { title: "Blog", subtitle: "The latest industry new and guides curated by our expert team.", href: "/", Icon: BookClosed },
            { title: "Customer stories", subtitle: "Learn how our customers are using Untitled UI to 10x their growth.", href: "/", Icon: Stars02 },
            { title: "Video tutorials", subtitle: "Get up and running on our newest features and in-depth guides.", href: "/", Icon: PlayCircle },
            { title: "Documentation", subtitle: "In-depth articles on our tools and technologies to empower teams.", href: "/", Icon: FileCode01 },
        ],
    },
    {
        title: "Company",
        items: [
            { title: "About us", subtitle: "Learn about our team and what we're working towards.", href: "/", Icon: Flag04 },
            { title: "Press", subtitle: "News and writings, press releases, and press resources.", href: "/", Icon: MessageCircle01 },
            {
                title: "Careers",
                subtitle: "We're always looking for talented people. Join our remote team!",
                href: "/",
                Icon: Users01,
                badge: (
                    <BadgeWithDot color="success" size="sm" type="modern">
                        We're hiring!
                    </BadgeWithDot>
                ),
            },
            { title: "Legal", subtitle: "Our company information, licensing information, terms, and privacy policy.", href: "/", Icon: Folder },
        ],
    },
];

export const Menu2ColWithSidebar = ({ className, isMobile }: { className?: string; isMobile?: boolean }) => {
    return (
        <section className={cx("overflow-hidden bg-primary md:shadow-lg", className)}>
            <div className="mx-auto flex max-w-container flex-col md:px-8 md:pb-6 xl:flex-row xl:pb-0">
                <div className="flex flex-col gap-5 pt-4 pb-5 md:flex-row md:pt-6 md:pr-6 md:pb-6">
                    {columns.map((column) => (
                        <div key={column.title} className="flex-1">
                            <h3 className="mb-3 px-4 text-sm font-semibold text-brand-tertiary md:px-0">{column.title}</h3>
                            <ul className="flex flex-col gap-0.5">
                                {column.items.map(({ title, subtitle, href, Icon, badge }) => (
                                    <li key={title}>
                                        <NavMenuItemLink icon={Icon} title={title} subtitle={isMobile ? "" : subtitle} badge={badge} href={href} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="relative z-10 w-full xl:max-w-140">
                    <div className="flex flex-col items-start bg-secondary pt-5 pb-6 md:rounded-2xl md:p-6 md:pr-8">
                        <div className="flex w-full justify-between">
                            <h3 className="mb-3 px-4 text-sm font-semibold text-brand-tertiary md:px-0">Tutorials</h3>
                            <div className="hidden px-4 leading-none md:inline-block md:px-0">
                                <Button color="link-color" size="md" href="/" iconTrailing={ArrowRight}>
                                    All video tutorials
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 md:gap-0.5">
                            <VideoCardHorizontal
                                href="#"
                                title="How to get started"
                                description="Jump right in—get an overview of the basics and get started on building."
                                imgSrc="https://www.untitledui.com/marketing/smiling-girl-2.webp"
                                actionsContent={
                                    <Button color="link-color" size="sm" iconLeading={PlayCircle} className="inline-flex justify-start">
                                        Watch video
                                    </Button>
                                }
                            />

                            <VideoCardHorizontal
                                href="#"
                                title="Advanced features"
                                description="Once you're ready, learn more about advanced analytics, features and shortcuts."
                                imgSrc="https://www.untitledui.com/marketing/smiling-girl-13.webp"
                                actionsContent={
                                    <Button color="link-color" size="sm" iconLeading={PlayCircle} className="inline-flex justify-start">
                                        Watch video
                                    </Button>
                                }
                            />
                        </div>
                        <div className="mt-4 px-4 leading-none md:hidden">
                            <Button color="link-color" size="md" href="/" iconTrailing={ArrowRight}>
                                All video tutorials
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
