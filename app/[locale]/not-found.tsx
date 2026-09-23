import { MoLink } from "@/components/brand/button";
import { Overline } from "@/components/brand/primitives";

export default function NotFound() {
  return (
    <div className="page-x mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-5 py-24 text-center">
      <Overline>404</Overline>
      <h1 className="display-lg">This page has evaporated.</h1>
      <p className="text-base text-[var(--ink-muted)]">
        The link may be old, or the fragrance may have been retired. The
        collection is still here.
      </p>
      <MoLink href="/en/collection">Shop the collection</MoLink>
    </div>
  );
}
