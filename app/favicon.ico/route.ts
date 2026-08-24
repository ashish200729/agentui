/** Keep browsers that probe the conventional favicon path on the branded mark. */
export function GET(request: Request) {
  return Response.redirect(new URL("/agentui-mark.svg", request.url), 307);
}
