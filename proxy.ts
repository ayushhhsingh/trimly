import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
])

const redirectTo = (path: string, reqUrl: string) => {
  return NextResponse.redirect(new URL(path, reqUrl))
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const isApiRequest = req.nextUrl.pathname.startsWith("/api/")

  // For API requests, only check auth, don't redirect
  // The API route will handle the actual response
  if (!userId && !isPublicRoute(req)) {
    if (isApiRequest) {
      // Don't return 401 here - let the API route handle it
      // This prevents body consumption issues
      return
    }
    return redirectTo("/sign-in", req.url)
  }

  if (userId && isPublicRoute(req) && req.nextUrl.pathname !== "/") {
    return redirectTo("/home", req.url)
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
