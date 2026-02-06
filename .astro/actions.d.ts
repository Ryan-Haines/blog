declare module "astro:actions" {
	type Actions = typeof import("/Users/ryanmacmini/Documents/GitHub/blog/src/actions/index.ts")["server"];

	export const actions: Actions;
}