export const darkenHexColor = (hexColor: string, percentage = 20) => {
    const hex = hexColor.replace(/^#/, "");

    let r = Number.parseInt(hex.substring(0, 2), 16);
    let g = Number.parseInt(hex.substring(2, 4), 16);
    let b = Number.parseInt(hex.substring(4, 6), 16);

    r = Math.max(0, Math.floor(r * (1 - percentage / 100)));
    g = Math.max(0, Math.floor(g * (1 - percentage / 100)));
    b = Math.max(0, Math.floor(b * (1 - percentage / 100)));

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};
