import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Alle Seiten sind beim Build vorgerendert und werden nie revalidiert. Der
// Worker liefert sie deshalb direkt aus den Static Assets aus, statt sie bei
// jedem Aufruf neu zu rendern. Kommt ISR oder revalidate dazu, braucht es
// stattdessen den R2-Cache: https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
