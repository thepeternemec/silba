export async function POST(request: Request) {
  const { password } = await request.json();
  const correct = password === process.env.DEMO_PASSWORD;
  return Response.json({ success: correct }, { status: correct ? 200 : 401 });
}
