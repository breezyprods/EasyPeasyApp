
// Follow Deno edge function v3 runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all users who haven't received a message today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id');
      
    if (usersError) throw usersError;
    
    // Get all users who already got a message today
    const { data: messagesReceived, error: messagesError } = await supabase
      .from('daily_messages')
      .select('user_id')
      .gte('sent_at', todayIso);
      
    if (messagesError) throw messagesError;
    
    // Convert to set for faster lookups
    const receivedSet = new Set(messagesReceived.map(m => m.user_id));
    
    // Filter users who haven't received a message
    const usersNeedingMessage = users.filter(user => !receivedSet.has(user.id));
    
    if (usersNeedingMessage.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All users have already received messages today' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    // Get motivational templates
    const { data: templates, error: templatesError } = await supabase
      .from('motivational_templates')
      .select('id, text');
      
    if (templatesError) throw templatesError;
    
    if (!templates || templates.length === 0) {
      throw new Error('No message templates found');
    }
    
    // For each user, send a random message
    const messagesToInsert = usersNeedingMessage.map(user => {
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      return {
        user_id: user.id,
        message_text: randomTemplate.text,
        sent_at: new Date().toISOString()
      };
    });
    
    const { error: insertError } = await supabase
      .from('daily_messages')
      .insert(messagesToInsert);
      
    if (insertError) throw insertError;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        messagesSent: messagesToInsert.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
      
  } catch (error) {
    console.error('Error in ensure-daily-messages function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
