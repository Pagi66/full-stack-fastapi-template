import { Moon01, Sun } from "@untitledui/icons";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { useTheme } from "@/providers/theme-provider";

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
        } else if (theme === "dark") {
            setTheme("system");
        } else {
            setTheme("light");
        }
    };

    const getIcon = () => {
        switch (theme) {
            case "dark":
                return Moon01;
            case "light":
                return Sun;
            default: // system
                return Sun; // Default to sun for system
        }
    };

    const getTooltip = () => {
        switch (theme) {
            case "dark":
                return "Switch to system theme";
            case "light":
                return "Switch to dark theme";
            default: // system
                return "Switch to light theme";
        }
    };

    return (
        <ButtonUtility
            color="tertiary"
            size="sm"
            icon={getIcon()}
            tooltip={getTooltip()}
            onClick={toggleTheme}
        />
    );
};