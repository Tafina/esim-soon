import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET");
      return new Response("Server configuration error", { status: 500 });
    }

    // Get headers
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    // Get body
    const payload = await request.text();

    // Verify webhook
    const wh = new Webhook(webhookSecret);
    let evt: {
      type: string;
      data: {
        id: string;
        email_addresses?: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
        image_url?: string;
      };
    };

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof evt;
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle events
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses?.[0]?.email_address;
      if (!email) {
        return new Response("No email found", { status: 400 });
      }

      const name = [first_name, last_name].filter(Boolean).join(" ") || undefined;

      await ctx.runMutation(internal.users.createOrUpdateFromWebhook, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url || undefined,
      });

      return new Response("User synced", { status: 200 });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      if (id) {
        await ctx.runMutation(internal.users.deleteUserInternal, { clerkId: id });
      }

      return new Response("User deleted", { status: 200 });
    }

    return new Response("Webhook received", { status: 200 });
  }),
});

export default http;
