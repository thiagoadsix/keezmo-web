import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import "./home.css";

export default function Home() {
  return (
    <>
      <main className="bg-[#FAFAFA] relative">
        <div className="p-10 border-b border-[#F2F2F2]">
          <div className="relative flex gap-3">
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full bg-[#131316] text-white text-sm font-semibold"
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 rounded-full bg-[#131316] text-white text-sm font-semibold">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </main>
    </>
  );
}
