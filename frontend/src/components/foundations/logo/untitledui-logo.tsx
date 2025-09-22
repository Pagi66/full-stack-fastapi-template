import type { ImgHTMLAttributes } from "react";

import { UntitledLogoMinimal } from "./untitledui-logo-minimal";

export const UntitledLogo = ({ alt = "Apex Trades", ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    <UntitledLogoMinimal alt={alt} {...props} />
);
