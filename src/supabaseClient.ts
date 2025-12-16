import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://dahaouxlolyicdwjuzhp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaGFvdXhsb2x5aWNkd2p1emhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDY5NTMsImV4cCI6MjA4MTQ4Mjk1M30.UxlrSyMSzJS0nrrTtrrz4daMGt13ioN3uQrNWnMeXEo"
);
