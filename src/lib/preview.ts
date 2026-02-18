/**
 * Check if we're in a preview/staging environment (not production).
 * Preview = dev mode OR Cloudflare Pages branch deploy (non-main).
 * CF_PAGES_BRANCH is set automatically by Cloudflare Pages.
 */
export function isPreview(): boolean {
  if (import.meta.env.DEV) return true;

  const branch =
    import.meta.env.CF_PAGES_BRANCH ??
    (typeof process !== 'undefined' ? process.env.CF_PAGES_BRANCH : undefined);

  if (branch && branch !== 'main') return true;

  return false;
}
