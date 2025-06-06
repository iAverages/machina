import { createEffect } from "solid-js";
import { useVibrant } from "~/hooks/use-vibrant";
import { darkenHexColor } from "~/utils/colors";

export const GradientBackground = (props: { src: string }) => {
    const colors = useVibrant({ src: () => props.src });

    // set the color for the body background (seen on the scrollbar track)
    // and the scroll thumb itself
    createEffect(() => {
        const styleId = "scrollbar-color";
        let styleElement = document.getElementById(styleId);

        if (!styleElement) {
            styleElement = document.createElement("style");
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }

        const baseColor = colors().gradientColor;
        const base = baseColor ? (darkenHexColor(baseColor, 30) ?? "hsl(var(--accent))") : "hsl(var(--accent))";
        const thumbColor = baseColor ? (darkenHexColor(baseColor, 50) ?? "hsl(var(--accent))") : "hsl(var(--accent))";
        styleElement.textContent = `
            body {
                background-color: ${base};
            } 
            ::-webkit-scrollbar-thumb {
                background-color: ${thumbColor};
            }
    `;
    });

    return (
        <div class="sticky h-0 top-0 inset-shadow-sm inset-shadow-red-500">
            <div
                style={{
                    "--color-a": colors().baseColor,
                    "--color-b": colors().gradientColor,
                }}
                class="transition-gradient-background w-full h-screen absolute top-0 pointer-events-none z-0"
            />
        </div>
    );
};
