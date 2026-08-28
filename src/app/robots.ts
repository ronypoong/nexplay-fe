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
        // 관리 콘솔과 담아둔 게임은 사람마다 다르거나 색인할 것이 없다.
        disallow: ["/search", "/admin", "/saved"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
