declare module "astro:actions" {
	type Actions = typeof import("/Users/ryanhaines/workspace/blog/src/actions/index.ts")["server"];

	export const actions: Actions;
}