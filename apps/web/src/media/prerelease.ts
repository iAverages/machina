import { JSDOM } from "jsdom";
import { vibrant } from "~/hooks/use-vibrant";
import { DEFAULT_GRADIENT, DEFAULT_THEME_COLOR } from "~/utils/consts";

export type MetaTags = {
    og: {
        site_name?: string;
        title?: string;
        image?: string;
        "image:type"?: string;
        description?: string;
        type?: string;
        [key: string]: string | undefined;
    };
    twitter: {
        card?: string;
        title?: string;
        description?: string;
        image?: string;
        [key: string]: string | undefined;
    };
    basic: {
        title?: string;
        [key: string]: string | undefined;
    };
};

const getData = async (id: string) => {
    const url = `https://open.spotify.com/prerelease/${id}`;
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const metaTags: MetaTags = {
        og: {},
        twitter: {},
        basic: {},
    };

    const metaElements = document.querySelectorAll("meta");

    metaElements.forEach((meta) => {
        const property = meta.getAttribute("property");
        const name = meta.getAttribute("name");
        const content = meta.getAttribute("content");
        if (!content) return;

        if (property?.startsWith("og:")) {
            const key = property.substring(3);
            metaTags.og[key] = content;
        } else if (name?.startsWith("twitter:")) {
            const key = name.substring(8);
            metaTags.twitter[key] = content;
        }
    });

    const titleElement = document.querySelector("title");
    if (titleElement?.textContent) {
        metaTags.basic.title = titleElement.textContent;
    }
    let color = DEFAULT_THEME_COLOR;
    if (metaTags.twitter.image) {
        const colors = await vibrant({ data: { src: metaTags.twitter.image } });
        if (colors.baseColor !== DEFAULT_GRADIENT.to) color = colors.baseColor;
    }

    return { type: "prerelease" as const, metaTags, id, color };
};

const getHeadMeta = ({ metaTags, color }: Awaited<ReturnType<typeof getData>>) => [
    ...Object.entries(metaTags.twitter).map(([prop, content]) => ({ name: `twitter:${prop}`, content })),
    ...Object.entries(metaTags.og).map(([prop, content]) => ({ name: `og:${prop}`, content })),
    { property: "theme-color", content: color },
];

export const prereleaseProcessor = async (id: string) => {
    const data = await getData(id);
    if (!data) return null;
    const meta = getHeadMeta(data);

    return { data, meta, id };
};
