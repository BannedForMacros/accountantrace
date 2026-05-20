import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/registro"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  const path = req.nextUrl.pathname;

  const isPublic = PUBLIC_PATHS.includes(path);

  if (session.userId && isPublic) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (!session.userId && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Excluye assets estaticos, API internas de Next, archivos publicos
    "/((?!_next/static|_next/image|favicon.ico|logo.jpeg|escenarios/.*).*)",
  ],
};
