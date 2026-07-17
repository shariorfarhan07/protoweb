/**
 * Fire a conversion/engagement event to every configured tag (GA4 + Meta Pixel).
 * Safe to call anywhere on the client — no-ops when tags aren't loaded.
 *
 * Standard events used:
 *   view_item / ViewContent, add_to_cart / AddToCart,
 *   begin_checkout / InitiateCheckout, purchase / Purchase
 */

type EventParams = {
  value?: number;
  currency?: string;
  items?: Array<{ item_id?: string | number; item_name?: string; price?: number; quantity?: number }>;
  [key: string]: unknown;
};

// GA4 event name → Meta Pixel standard event name
const META_EVENT_MAP: Record<string, string> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  search: "Search",
  generate_lead: "Lead",
  sign_up: "CompleteRegistration",
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;

  try {
    window.gtag?.("event", name, params);

    const metaName = META_EVENT_MAP[name];
    if (metaName && window.fbq) {
      window.fbq("track", metaName, {
        value: params.value,
        currency: params.currency ?? "BDT",
        content_ids: params.items?.map((i) => String(i.item_id)),
        content_type: "product",
      });
    }
  } catch {
    // Analytics must never break the app.
  }
}
