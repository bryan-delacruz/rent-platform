import { clerkMiddleware } from '@clerk/nextjs/server';

/**
 * Only attaches the session to the request. Protection happens where the data
 * is read: the (app) layout calls auth.protect() and every server action and
 * query calls requireOwner(), so a route pattern can never leave data exposed.
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
