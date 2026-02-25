// Edge function disabled - app uses client-side storage
export default {
  fetch: () => new Response("Not configured", { status: 503 })
};
