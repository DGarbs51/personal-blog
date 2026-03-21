import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export const GET = async (context: APIContext) => {
  const site = context.site;
  if (site === undefined) {
    return new Response("Site URL is not configured.", { status: 500 });
  }

  const posts = await getCollection("blog");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items: posts.map(post => ({
      ...post.data,
      link: `/blog/${post.id}/`,
    })),
  });
};
