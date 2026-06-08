/**
 * Desktop notification helper built on @tauri-apps/plugin-notification.
 *
 * Used to alert the user about ingredients that are expired or expiring soon.
 * Permission is requested lazily on first use.
 */
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import type { Ingredient } from "../types/ingredient";
import { daysUntil, expiringSoon } from "../calendar/expiration";

/** Ensure we may post notifications, asking the user once if needed. */
export async function ensureNotificationPermission(): Promise<boolean> {
  let granted = await isPermissionGranted();
  if (!granted) {
    granted = (await requestPermission()) === "granted";
  }
  return granted;
}

/**
 * Summarise expiring/expired items in a single notification.
 * No-op when nothing is expiring or permission is denied.
 */
export async function notifyExpiring(items: Ingredient[]): Promise<void> {
  const at_risk = expiringSoon(items);
  if (at_risk.length === 0) return;

  if (!(await ensureNotificationPermission())) return;

  const expired = at_risk.filter((i) => daysUntil(i.expirationDate) < 0);
  const names = at_risk
    .map((i) => i.name)
    .slice(0, 3)
    .join(", ");
  const more = at_risk.length > 3 ? ` +${at_risk.length - 3} more` : "";

  sendNotification({
    title: expired.length
      ? `${expired.length} ingredient(s) expired`
      : "Ingredients expiring soon",
    body: `${names}${more}`,
  });
}
