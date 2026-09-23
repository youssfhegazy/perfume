import { NotFoundState } from "@/components/brand/error-state";

/* Inside the (store) group so a missing product or page keeps the header,
   footer and bag rather than dropping the visitor onto a bare page. */
export default function StoreNotFound() {
  return <NotFoundState />;
}
