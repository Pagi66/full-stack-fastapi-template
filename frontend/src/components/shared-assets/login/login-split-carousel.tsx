import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Carousel } from "@/components/application/carousel/carousel-base";
import { CarouselIndicator } from "@/components/application/carousel/carousel.demo";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { ActiveUsersChart } from "@/components/shared-assets/illustrations/active-users-chart";
import { UsersChart } from "@/components/shared-assets/illustrations/users-chart";
import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/providers/auth-provider";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";

export const LoginSplitCarousel = () => {
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const router = useRouter();
    const { login, isLoading } = useAuth();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('username') as string;
        const password = formData.get('password') as string;

        try {
            const role = await login(email, password);
            const destination = role === 'admin' ? '/admin/dashboard' : '/dashboard';
            setShowSuccess(true);
            // Brief success confirmation, then navigate
            setTimeout(() => router.navigate({ to: destination }), 900);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Login failed');
        }
    };

    return (
        <>
        <section className="grid min-h-screen grid-cols-1 bg-primary lg:grid-cols-2">
            <div className="flex flex-col bg-primary">
                <div className="flex flex-1 justify-center px-4 py-12 md:items-center md:px-8 md:py-32">
                    <div className="flex w-full flex-col gap-8 sm:max-w-90">
                        <div className="flex flex-col gap-6 md:gap-20">
                            <UntitledLogo className="max-md:hidden" />
                            <UntitledLogoMinimal className="size-10 md:hidden" />
                            <div className="flex flex-col gap-2 md:gap-3">
                                <h1 className="text-display-xs font-semibold text-primary md:text-display-md">Log in</h1>
                                <p className="text-md text-tertiary">Welcome back! Please enter your details.</p>
                            </div>
                        </div>

                        <Form onSubmit={handleLogin} className="flex flex-col gap-6">
                            <fieldset disabled={isLoading} className="flex flex-col gap-5">
                                <Input isRequired hideRequiredIndicator label="Email" type="email" name="username" placeholder="Enter your email" size="md" />
                                <Input isRequired hideRequiredIndicator label="Password" type="password" name="password" size="md" placeholder="••••••••" />
                            </fieldset>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <div className="flex items-center">
                                <Checkbox label="Remember for 30 days" name="remember" />

                                <Button color="link-color" size="md" href="#" className="ml-auto">
                                    Forgot password
                                </Button>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button type="submit" size="lg" disabled={isLoading}>
                                    {isLoading ? "Signing in..." : "Sign in"}
                                </Button>
                                <SocialButton social="google" theme="color">
                                    Sign in with Google
                                </SocialButton>
                            </div>
                        </Form>

                        <div className="flex justify-center gap-1 text-center">
                            <span className="text-sm text-tertiary">Don't have an account?</span>
                            <Button href="/signup" color="link-color" size="md">
                                Sign up
                            </Button>
                        </div>
                    </div>
                </div>

                <footer className="hidden p-8 pt-11 lg:block">
                    <p className="text-sm text-tertiary">&copy; {new Date().getFullYear()} Apex Trades</p>
                </footer>
            </div>

            <div className="relative hidden items-center justify-center overflow-hidden bg-brand-section lg:flex">
                <Carousel.Root className="z-10 flex w-full flex-col items-center gap-12">
                    <Carousel.Content overflowHidden={false}>
                        {Array.from({
                            length: 4,
                        }).map((_, i) => (
                            <Carousel.Item key={i} className="w-full">
                                <div className="flex flex-col items-center gap-12">
                                    <div className="relative flex pb-10">
                                        <UsersChart />

                                        <ActiveUsersChart className="absolute -right-10 bottom-0 size-[192px]" />
                                    </div>
                                    <div className="flex flex-col gap-2 text-center">
                                        <p className="text-xl font-semibold text-primary_on-brand">Welcome to your new dashboard</p>
                                        <p className="text-md font-medium text-tertiary_on-brand">Sign in to explore changes we've made.</p>
                                    </div>
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel.Content>
                    <div className="flex items-center justify-center gap-16">
                        <Carousel.PrevTrigger className="cursor-pointer rounded-full p-2 outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2">
                            <ChevronLeft className="size-5 text-fg-white" />
                        </Carousel.PrevTrigger>

                        <CarouselIndicator />

                        <Carousel.NextTrigger className="cursor-pointer rounded-full p-2 outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2">
                            <ChevronRight className="size-5 text-fg-white" />
                        </Carousel.NextTrigger>
                    </div>
                </Carousel.Root>
            </div>
        </section>
        {showSuccess && (
            <ModalOverlay isOpen onOpenChange={(open) => !open && setShowSuccess(false)}>
                <Modal>
                    <Dialog className="max-w-sm rounded-2xl bg-primary p-6 text-center shadow-xl ring-1 ring-secondary">
                        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-utility-success-50 text-utility-success-700 ring-1 ring-utility-success-200">
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6">
                                <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-primary">Success</h3>
                        <p className="mt-1 text-sm text-tertiary">Logged in successfully. Redirecting…</p>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        )}
        </>
    );
};

