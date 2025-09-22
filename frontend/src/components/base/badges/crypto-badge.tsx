import React from "react";

export const CryptoBadge = ({ children }: { children: string }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {children}
    </span>
);


