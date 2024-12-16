import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer id="footer" className="bg-neutral-900/50 border-t border-neutral-800">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Keezmo
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              AI-powered flashcards for effective learning
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-sm text-gray-600 hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#plans" className="text-sm text-gray-600 hover:text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-sm text-gray-600 hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800">
          <p className="text-sm text-neutral-400 text-center">
            © {new Date().getFullYear()} Keezmo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}