export function appUrl(pathname: string, requestUrl: string) {
  const configuredOrigin = process.env["NEXT_PUBLIC_APP_URL"];
  const baseUrl = configuredOrigin || requestUrl;
  return new URL(pathname, baseUrl);
}
