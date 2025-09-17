import { Button } from "@/components/base/buttons/button";
import { StarIcon } from "@/components/foundations/rating-stars";

export const ContentSectionSplitImage02 = () => {
    return (
        <section className="bg-primary py-16 md:py-24">
            <div className="mx-auto grid w-full max-w-container grid-cols-1 gap-12 px-4 md:gap-16 md:px-8 lg:grid-cols-2">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-brand-secondary md:text-md">Case study</span>
                    <h2 className="mt-3 text-display-sm font-semibold text-primary md:text-display-md">How we helped Hourglass</h2>
                    <div className="prose mt-12 md:prose-lg">
                        <hr />
                        <p>
                            Mi tincidunt elit, id quisque ligula ac diam, amet. Vel etiam suspendisse morbi eleifend faucibus eget vestibulum felis. Dictum quis
                            montes, sit sit. Tellus aliquam enim urna, etiam.
                        </p>
                        <p>
                            Eget quis mi enim, leo lacinia pharetra, semper. Eget in volutpat mollis at volutpat lectus velit, sed auctor. Porttitor fames arcu
                            quis fusce augue enim. Quis at habitant diam at. Suscipit tristique risus, at donec. In turpis vel et quam imperdiet. Ipsum molestie
                            aliquet sodales id est ac volutpat.
                        </p>

                        <h3 className="mb-4! text-display-xs! font-semibold md:mt-8">Closing more clients</h3>
                        <p>
                            Dolor enim eu tortor urna sed duis nulla. Aliquam vestibulum, nulla odio nisl vitae. In aliquet pellentesque aenean hac vestibulum
                            turpis mi bibendum diam. Tempor integer aliquam in vitae malesuada fringilla.
                        </p>
                    </div>
                    <div className="mt-12 hidden gap-3 md:flex">
                        <Button color="secondary" size="xl">
                            Chat to us
                        </Button>
                        <Button size="xl">Read case study</Button>
                    </div>
                </div>

                <div className="relative h-140 lg:h-160">
                    <img src="https://www.untitledui.com/images/portraits/lulu-meyers" className="size-full object-cover" alt="Lulu Meyers" />

                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/40 to-black/0 pt-16 md:pt-20 lg:pt-24">
                        <div className="relative flex flex-col gap-1.5 bg-primary/30 p-4 pb-5 backdrop-blur-[10px] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-alpha-white/30 md:gap-2 md:p-6">
                            <div className="flex flex-col-reverse justify-between gap-4 md:flex-row">
                                <p className="text-xl font-semibold whitespace-nowrap text-white md:text-display-xs">Lulu Meyers</p>

                                <div aria-hidden="true" className="flex gap-1">
                                    <StarIcon className="text-white" />
                                    <StarIcon className="text-white" />
                                    <StarIcon className="text-white" />
                                    <StarIcon className="text-white" />
                                    <StarIcon className="text-white" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-0.5">
                                <p className="text-md font-semibold text-white">PM, Hourglass</p>
                                <p className="text-sm font-medium text-white">Web Design Agency</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:hidden">
                    <Button size="xl">Read case study</Button>
                    <Button color="secondary" size="xl">
                        Chat to us
                    </Button>
                </div>
            </div>
        </section>
    );
};
