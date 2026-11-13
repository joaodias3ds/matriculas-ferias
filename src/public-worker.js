export default { async fetch(request, env) { return new URL(request.url).pathname.startsWith('/api/') ? env.BACKEND.fetch(request) : env.ASSETS.fetch(request); } };
