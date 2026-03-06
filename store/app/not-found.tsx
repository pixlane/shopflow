import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-5">
        <p className="text-7xl font-light text-muted-foreground/30 tracking-tighter">404</p>
        <div>
          <h1 className="text-xl font-medium">Page not found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Link
          href="/store"
          className="inline-flex h-10 px-5 rounded-md bg-foreground text-background text-sm font-medium items-center hover:bg-foreground/90 transition-colors"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
