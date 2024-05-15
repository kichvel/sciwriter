import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";


export const GET = handleAuth(NextRequest, AuthEndpoints)
