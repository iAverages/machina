export const removeTrailingSlash = (url: string) => {
    return url.endsWith("/") ? url.slice(0, -1) : url;
};

export const getBaseDomain = (url: string) => new URL(url).hostname;
