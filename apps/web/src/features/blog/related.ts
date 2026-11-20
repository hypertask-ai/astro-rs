import type { BlogPost } from "./posts.js";

const sortByDate = (a: BlogPost, b: BlogPost): number =>
  b.date.localeCompare(a.date);

const sharedTags = (post: BlogPost, candidate: BlogPost): number => {
  let shared = 0;

  for (const tag of candidate.tags) {
    if (post.tags.includes(tag)) {
      shared += 1;
    }
  }

  return shared;
};

const scoreOf = (post: BlogPost, candidate: BlogPost): number =>
  (candidate.cluster !== "" && candidate.cluster === post.cluster ? 2 : 0) +
  sharedTags(post, candidate);

export const relatedPostSlugs = (
  post: BlogPost,
  all: readonly BlogPost[],
  limit = 3
): readonly string[] => {
  const candidates: BlogPost[] = [];
  const ranked: { post: BlogPost; score: number }[] = [];

  for (const candidate of all) {
    if (candidate.slug !== post.slug) {
      candidates.push(candidate);
      ranked.push({ post: candidate, score: scoreOf(post, candidate) });
    }
  }

  ranked.sort((a, b) => b.score - a.score || sortByDate(a.post, b.post));

  const chosen: string[] = [];
  const chosenSlugs = new Set<string>();

  for (const entry of ranked) {
    if (entry.score > 0) {
      chosen.push(entry.post.slug);
      chosenSlugs.add(entry.post.slug);
    }
  }

  if (chosen.length >= limit) {
    return chosen.slice(0, limit);
  }

  const backfill = candidates
    .filter((candidate) => !chosenSlugs.has(candidate.slug))
    .toSorted(sortByDate);

  for (const candidate of backfill) {
    chosen.push(candidate.slug);
  }

  return chosen.slice(0, limit);
};
