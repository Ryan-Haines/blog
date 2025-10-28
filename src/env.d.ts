/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        DB: D1Database;
        TURNSTILE_SECRET_KEY: string;
        ADMIN_KEY?: string;
      };
    };
  }
}

