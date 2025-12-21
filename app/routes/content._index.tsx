import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return redirect(`/${url.search}`);
}

export default function ContentIndex() {
  return null;
}
