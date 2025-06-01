import { Metadata, MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/home", "/about"],
            disallow: ["/api", "/admin"]
        },
        sitemap: `${process.env.PUBLIC_URL}/sitemap.xml`,
    }
}