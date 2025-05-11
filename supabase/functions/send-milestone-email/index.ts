
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    // Get the request body
    const { userId, chapter } = await req.json();
    
    // Validate parameters
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId parameter" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    if (!chapter || ![5, 10, 20].includes(chapter)) {
      return new Response(
        JSON.stringify({ error: "Invalid milestone chapter. Must be 5, 10, or 20" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Get user email from auth
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(userId);
    if (authError || !authUser.user) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve user details" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const userEmail = authUser.user.email;
    
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "User has no email address" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Logic here to send email
    // This is where you'd integrate with an email service like SendGrid, AWS SES, etc.
    // For now, we'll just log the event and simulate success
    
    console.log(`[MILESTONE EMAIL] User: ${userId}, Email: ${userEmail}, Chapter: ${chapter}`);
    
    let emailSubject = "";
    let emailBody = "";
    
    switch (chapter) {
      case 5:
        emailSubject = "Congratulations on Your First Major Step! - EasyPeasy";
        emailBody = "You've completed Chapter 5 - this is a significant milestone in your journey to freedom!";
        break;
      case 10:
        emailSubject = "You're Halfway Free! - EasyPeasy";
        emailBody = "You've completed Chapter 10 - you're now halfway through your journey to complete freedom!";
        break;
      case 20:
        emailSubject = "You've Completed the Journey! - EasyPeasy";
        emailBody = "Congratulations! You've completed all 20 chapters and are now free. Your streak starts today!";
        break;
    }
    
    // Record in DB that we sent this milestone email
    const { error: insertError } = await supabaseClient
      .from('milestones_sent')
      .insert({
        user_id: userId,
        chapter,
        sent_at: new Date().toISOString(),
      });
    
    if (insertError) {
      console.error('Error recording milestone:', insertError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email would be sent to ${userEmail} for chapter ${chapter}`,
        subject: emailSubject,
        body: emailBody
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error('Error processing milestone email:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
