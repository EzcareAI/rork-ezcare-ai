import Purchases from "react-native-purchases";
import { supabase } from "@/lib/supabase";
import PRODUCTS from "@/config/products";

type MinimalUser = { id: string };

export async function syncSubscription(user: MinimalUser) {
  if (!user?.id) throw new Error("syncSubscription requires a user with an id");

  const customerInfo = await Purchases.getCustomerInfo();
  const subsById = customerInfo?.subscriptionsByProductIdentifier || {};

  const activeSubs: Array<{ productId: string; purchaseDateMs: number }> = [];
  for (const [productId, details] of Object.entries(subsById)) {
    try {
      const isActive = details && details.isActive;
      const purchaseDate =
        details && (details.purchaseDate || details.originalPurchaseDate);
      if (isActive && purchaseDate) {
        const ms = new Date(purchaseDate).getTime();
        if (!Number.isNaN(ms)) {
          activeSubs.push({ productId, purchaseDateMs: ms });
        }
      }
    } catch (e) {
      console.error("syncSubscription: error processing subscription", e);
    }
  }

  activeSubs.sort((a, b) => b.purchaseDateMs - a.purchaseDateMs);

  let planKey: string | undefined = undefined;

  if (activeSubs.length > 0) {
    const base = String(activeSubs[0].productId).split(":")[0];
    planKey = Object.keys(PRODUCTS).find(
      (k) => PRODUCTS[k].monthly === base || PRODUCTS[k].yearly === base
    );
  }

  if (!planKey) planKey = "trial";

  const credits =
    planKey === "starter"
      ? 50
      : planKey === "pro"
      ? 300
      : planKey === "premium"
      ? "∞"
      : undefined;

  const updateObj: any = { subscription_plan: planKey };
  if (credits !== undefined) updateObj.credits = credits;

  const { data, error } = await supabase
    .from("users")
    .update(updateObj)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.warn("syncSubscription: failed to update Supabase user", error);
  }

  try {
    if (activeSubs.length > 0) {
      const chosen = activeSubs[0];
      const productId = String(chosen.productId);
      const details: any = subsById[productId] || {};
      const startDate =
        details.purchaseDate ||
        details.originalPurchaseDate ||
        new Date(chosen.purchaseDateMs).toISOString();
      const endDate = details.expiresDate || null;
      const storeTransactionId = details.storeTransactionId || null;

      const insertObj: any = {
        user_id: user.id,
        plan_id: planKey,
        revenuecat_subscription_id: productId,
        revenuecat_transaction_id: storeTransactionId,
        status: "active",
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
        renewal_date: endDate ? new Date(endDate).toISOString() : null,
      };

      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .insert(insertObj);
      if (insertError) {
        console.warn(
          "syncSubscription: failed to insert user_subscriptions row",
          insertError
        );
      }
    }
  } catch (e) {
    console.warn("syncSubscription: error inserting user_subscriptions", e);
  }

  return { planKey, customerInfo, data, error };
}

export default syncSubscription;
