import { withAuth } from "next-auth/middleware";

// protect all routes except for the login page
export default withAuth({
  pages: {
    signIn: "/signin", 
  },
  secret: process.env.NEXTAUTH_SECRET, 
});

// exclude /signin and /public
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|signin|lessons).*)",
  ],
};