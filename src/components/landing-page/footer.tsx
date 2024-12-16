import Link from "next/link";
import { Mail } from "lucide-react";
import { XIcon } from "@/src/icons/x";
import { InstagramIcon } from "@/src/icons/instagram";

export function Footer() {
  return (
    <footer id="footer" className="mt-24 bg-neutral-900/50 border-t border-neutral-800">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4 py-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Keezmo
              </span>
            </Link>
            <p className="mt-4 text-sm text-neutral-400">
              AI-powered flashcards for effective learning
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-3 text-white">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-sm text-neutral-400 transition-colors hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#plans" className="text-sm text-neutral-400 transition-colors hover:text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3 text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-sm text-neutral-400 transition-colors hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-neutral-400 transition-colors hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-3 text-white">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 transition-colors hover:text-primary"
                aria-label="Follow us on Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 transition-colors hover:text-primary"
                aria-label="Follow us on X"
              >
                <XIcon className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@keezmo.com"
                className="text-neutral-400 transition-colors hover:text-primary"
                aria-label="Contact us via email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 px-4 py-8">
          <p className="text-sm text-neutral-400 text-center">
            © {new Date().getFullYear()} Keezmo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}