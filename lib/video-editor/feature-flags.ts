// Feature flags for Andres Video Studio.
//
// All flags reflect the current implemented state of the application.
// Set ENABLE_HYPERFRAMES=true in your environment to activate the Hyperframes
// motion engine when it is available. All other flags are static at this level.

export const FEATURE_FLAGS = {
  /** Copy review gate pauses the pipeline for manual copy approval. */
  ENABLE_COPY_REVIEW: true,

  /** BarberiaOS Content Studio mode with booking URL and QR overlay. */
  ENABLE_BARBERIAOS_MODE: true,

  /** QR code overlay on the end screen (requires BarberiaOS mode). */
  ENABLE_QR_OVERLAY: true,

  /** Export delivery ZIP containing video, copy pack, and publishing pack. */
  ENABLE_EXPORT_ZIP: true,

  /** Client management system (create, assign, track). */
  ENABLE_CLIENTS: true,

  /** Agency dashboard with metrics, weekly chart, and activity feed. */
  ENABLE_DASHBOARD: true,

  /**
   * External AI provider for copy generation (OpenAI, Anthropic, Gemini).
   * Disabled — the app currently uses local rule-based copy generation.
   * Set to true and configure the relevant API key when ready.
   */
  ENABLE_AI_PROVIDER: false,

  /**
   * Hyperframes motion engine for animated hook/CTA overlays.
   * Falls back to the static overlay engine when false.
   * Can be toggled via the ENABLE_HYPERFRAMES environment variable.
   */
  ENABLE_HYPERFRAMES: process.env.ENABLE_HYPERFRAMES === "true",
} satisfies Record<string, boolean>;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
