import { auth } from "@clerk/nextjs/server";
import { UserRole, ROLES } from "@/constants/roles";
import connectDB from "./db";
import User from "@/models/User";

/**
 * Gets the current user's clerk ID.
 * Returns null if not authenticated.
 */
export async function getClerkId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Gets the current user's database record.
 * Connects to DB and fetches the user based on Clerk ID.
 */
export async function getCurrentUser() {
  const clerkId = await getClerkId();
  if (!clerkId) return null;

  await connectDB();
  const user = await User.findOne({ clerkId });
  return user;
}

/**
 * Gets the current user's role from the database.
 * Returns null if user is not found or not authenticated.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return user.role as UserRole;
}

/**
 * Checks if the user is authenticated and has the specified role.
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

/**
 * Checks if the user has completed onboarding.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.onboardingCompleted;
}
