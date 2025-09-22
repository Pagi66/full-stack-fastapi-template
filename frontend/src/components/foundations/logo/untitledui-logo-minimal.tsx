import type { ImgHTMLAttributes } from "react";

const LOGO_SRC = "/images/Tech Trading Platform Logo - Apex, Wordmark Style (1).svg";

export const UntitledLogoMinimal = ({ alt = "Apex Trades", ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={LOGO_SRC} alt={alt} {...props} />
);

