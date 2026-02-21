const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_url, sign_name } = await req.json();

    if (!image_url || !sign_name) {
      return new Response(
        JSON.stringify({ error: "Missing image_url or sign_name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitise the filename: lowercase, replace spaces with hyphens
    const filename = sign_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

    // Fetch the image data from the AI-generated URL
    const imageResponse = await fetch(image_url);
    if (!imageResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch source image" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Content = btoa(
      new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // Commit to GitHub via the API
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    if (!GITHUB_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Server config error: missing GITHUB_TOKEN" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const owner = "chaeyoonyunakim";
    const repo = "getting-started-with-mackathon";
    const path = `public/symbols/${filename}.png`;

    // Check if file already exists (to get its SHA for update)
    let sha: string | undefined;
    const checkRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "CodeWords" } }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }

    const commitBody: Record<string, string> = {
      message: `Add symbol: ${sign_name}`,
      content: base64Content,
      branch: "main",
    };
    if (sha) commitBody.sha = sha;

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "CodeWords",
        },
        body: JSON.stringify(commitBody),
      }
    );

    if (!commitRes.ok) {
      const errText = await commitRes.text();
      console.error("GitHub commit error:", commitRes.status, errText);
      return new Response(
        JSON.stringify({ error: "GitHub commit failed", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const commitData = await commitRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        path: commitData.content?.path,
        html_url: commitData.content?.html_url,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("makaton-save-symbol error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
