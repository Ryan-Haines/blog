declare module "astro:actions" {
	type Actions = typeof import("/private/tmp/blog-check/src/actions/index.ts")["server"];

	export const actions: Actions;
}