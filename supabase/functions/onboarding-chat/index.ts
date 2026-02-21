import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are DigiWebDex's friendly onboarding assistant. You help customers in both Bangla and English (respond in the language the user writes in).

Your role:
1. **Service Selection**: Help users choose the right service — Domain Registration, Web Hosting, Website/App Development, Digital Marketing, or Software Development.
2. **Domain & Hosting Guidance**: Explain TLDs (.com, .bd, .com.bd), suggest domain names, recommend hosting plans based on needs (personal blog vs business vs e-commerce).
3. **Payment Guidance**: Walk users through payment options:
   - **bKash Personal**: Send to 01XXXXXXXXX (Personal number)
   - **Bank Transfer**: Pubali Bank Ltd, A/C Name: Md. Iqbal Hossain, A/C: 2706101077904, Routing: 175260162, Asad Avenue Branch
   - **Cash Payment**: Accepted at DigiWebDex office
   After payment, guide them to submit proof via the dashboard Payment page.
4. **Post-Order Support**: Help with order status questions, next steps after payment, timeline expectations, and troubleshooting.

Key info:
- Domain .com starts from ৳1,200/year, .com.bd from ৳1,500/year
- Hosting starts from ৳2,000/year (Basic), ৳4,500/year (Business), ৳8,000/year (Premium)
- Website development starts from ৳15,000 for basic sites
- Always be warm, professional, and concise
- Use bullet points and clear formatting
- If unsure, suggest contacting support via WhatsApp or the contact form`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("onboarding-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
