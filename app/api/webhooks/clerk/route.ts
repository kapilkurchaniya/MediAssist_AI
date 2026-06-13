import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  await connectDB();

  if (eventType === "user.created") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { email_addresses, first_name, last_name, image_url } = evt.data as any;
    
    const primaryEmail = email_addresses?.[0]?.email_address || "";
    const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "New User";

    try {
      await User.create({
        clerkId: id,
        email: primaryEmail,
        fullName: fullName,
        avatarUrl: image_url,
        role: "patient",
        onboardingCompleted: false,
      });
      console.log(`User ${id} created in MongoDB`);
    } catch (error) {
      console.error("Error creating user in DB via webhook:", error);
      // Don't return 500, else Clerk will keep retrying
    }
  }

  if (eventType === "user.updated") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { email_addresses, first_name, last_name, image_url } = evt.data as any;
    
    const primaryEmail = email_addresses?.[0]?.email_address;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim();

    try {
      const user = await User.findOne({ clerkId: id });
      if (user) {
        if (primaryEmail) user.email = primaryEmail;
        if (fullName) user.fullName = fullName;
        if (image_url) user.avatarUrl = image_url;
        await user.save();
        console.log(`User ${id} updated in MongoDB`);
      }
    } catch (error) {
      console.error("Error updating user in DB via webhook:", error);
    }
  }

  if (eventType === "user.deleted") {
    try {
      await User.deleteOne({ clerkId: id });
      console.log(`User ${id} deleted from MongoDB`);
      // Note: We might want to handle cascading deletes for profiles, prescriptions, etc.
      // But keeping them might be necessary for auditing, so soft delete is usually preferred.
    } catch (error) {
      console.error("Error deleting user in DB via webhook:", error);
    }
  }

  return new Response("", { status: 200 });
}
