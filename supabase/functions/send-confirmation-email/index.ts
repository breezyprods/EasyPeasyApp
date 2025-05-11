
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  confirmationUrl: string;
  firstName?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl, firstName }: EmailRequest = await req.json();
    const name = firstName || "Friend";

    const emailResponse = await resend.emails.send({
      from: "EasyPeasy <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Your Journey with EasyPeasy!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4F46E5; font-size: 24px; margin-bottom: 10px;">Welcome to EasyPeasy!</h1>
            <p style="font-size: 16px;">We're so glad you're here, ${name}.</p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">Today marks the beginning of a meaningful journey toward freedom and wellness. Every step you take with EasyPeasy brings you closer to the life you truly deserve.</p>
            
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">We believe in your strength and resilience. The fact that you're here shows your commitment to positive change, and that's something to be incredibly proud of.</p>
            
            <p style="font-size: 16px; line-height: 1.5;">To get started on your journey, please verify your email address:</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${confirmationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Confirm My Email</a>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; line-height: 1.5;">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="font-size: 14px; word-break: break-all; color: #4F46E5;">${confirmationUrl}</p>
          </div>
          
          <div style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            <p>Remember, you're not alone on this journey. We're here to support you every step of the way.</p>
            <p>With warmth and belief in you,</p>
            <p>The EasyPeasy Team</p>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 20px;">
            <p>If you didn't sign up for EasyPeasy, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in send-confirmation-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
