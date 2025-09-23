
import React, { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { UsersService } from "@/api";

export const SignupSplitCarousel = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSignup: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            const firstName = (formData.get("first_name") as string)?.trim();
            const lastName = (formData.get("last_name") as string)?.trim();
            const email = (formData.get("email") as string)?.trim();
            const password = formData.get("password") as string;

            const full_name = [firstName, lastName].filter(Boolean).join(" ") || undefined;

            await UsersService.usersRegisterUser({ email, password, full_name });
            setShowSuccess(true);
            setTimeout(() => router.navigate({ to: "/login" }), 1200);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Signup failed";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <section className="grid h-screen grid-cols-1 bg-primary lg:grid-cols-2">
            <div className="flex flex-col bg-primary">
                <div className="flex flex-1 justify-center px-4 py-4 md:items-center md:px-8 md:py-8">
                    <div className="flex w-full flex-col gap-4 sm:max-w-90">
                        <div className="flex flex-col items-center gap-4">
                            <UntitledLogo className="max-md:hidden w-[165px] h-[115.5px]" />
                            <UntitledLogoMinimal className="w-[165px] h-[115.5px] md:hidden" />
                            <div className="flex flex-col gap-1 text-center">
                                <h1 className="text-xl font-semibold text-primary md:text-2xl">Sign up</h1>
                                <p className="text-sm text-tertiary">Create your account to get started.</p>
                            </div>
                        </div>

                        <Form onSubmit={handleSignup} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <Input isRequired hideRequiredIndicator label="First name" type="text" name="first_name" placeholder="Enter your first name" size="md" />
                                    <Input isRequired hideRequiredIndicator label="Last name" type="text" name="last_name" placeholder="Enter your last name" size="md" />
                                </div>
                                <Input isRequired hideRequiredIndicator label="Email" type="email" name="email" placeholder="Enter your email" size="md" />
                                <Input isRequired hideRequiredIndicator label="Password" type="password" name="password" size="md" placeholder="Create a password" />
                            </div>

                            <div className="flex items-start">
                                <Checkbox 
                                    label={
                                        <span className="text-sm text-tertiary">
                                            I agree to the{" "}
                                            <Button color="link-color" size="sm" href="#" className="inline">
                                                Terms of Service
                                            </Button>
                                            {" "}and{" "}
                                            <Button color="link-color" size="sm" href="#" className="inline">
                                                Privacy Policy
                                            </Button>
                                        </span>
                                    } 
                                    name="terms" 
                                    isRequired
                                />
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <div className="flex flex-col gap-4">
                                <Button type="submit" size="lg" disabled={isLoading}>
                                    {isLoading ? "Creating account..." : "Create account"}
                                </Button>
                                <SocialButton social="google" theme="color">
                                    Sign up with Google
                                </SocialButton>
                            </div>
                        </Form>

                        <div className="flex justify-center gap-1 text-center">
                            <span className="text-sm text-tertiary">Already have an account?</span>
                            <Button href="/login" color="link-color" size="md">
                                Log in
                            </Button>
                        </div>
                    </div>
                </div>

                <footer className="hidden p-8 pt-11 lg:block">
                    <p className="text-sm text-tertiary">&copy; {new Date().getFullYear()} Apex Trades</p>
                </footer>
            </div>

            <div className="relative hidden items-center justify-center overflow-hidden bg-brand-section lg:flex">
                <div className="absolute inset-0">
                    <video 
                        className="w-full h-full object-cover"
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        src="/images/trading-promo-video.hvc1.8bc71e78d0a69d3ec896.mp4"
                    >
                        <source src="/images/trading-promo-video.hvc1.8bc71e78d0a69d3ec896.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                    <h2 className="text-4xl font-bold text-white">Rediscover New Heights</h2>
                    <p className="text-xl text-white/90">Professional trading platform with institutional-grade tools</p>
                </div>
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
                        <h3 className="text-lg font-semibold text-primary">Account created</h3>
                        <p className="mt-1 text-sm text-tertiary">Your account was created successfully. Redirecting…</p>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        )}
        </>
    );
};
