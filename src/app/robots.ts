import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 검색창은 색인해도 얻을 게 없다. 같은 카탈로그를 다시 보여줄 뿐이고
        // 쿼리 조합마다 다른 URL 이 생겨 중복 페이지만 늘어난다.
        disallow: ["/search"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
