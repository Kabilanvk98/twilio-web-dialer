// server.js
const express = require("express");
const twilio = require("twilio");

const app = express();

// Serve your public/index.html
app.use(express.static("public"));

// Parse Twilio webhook form data
app.use(express.urlencoded({ extended: false }));

// Environment variables (set these in Render dashboard)
const ACCOUNT_SID = process.env.ACCOUNT_SID;   // ACxxxxxxxx
const API_KEY     = process.env.API_KEY;       // SKxxxxxxxx
const API_SECRET  = process.env.API_SECRET;    // API key secret
const CALLER_ID   = process.env.CALLER_ID;     // +1XXXXXXXXXX (your Twilio number)
const TWIML_APP_SID = process.env.TWIML_APP_SID; // TwiML App SID

console.log("SERVER STARTED – WEB DIALER");

// /token -> generate Voice access token for browser
app.get("/token", (req, res) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant  = AccessToken.VoiceGrant;

  if (!ACCOUNT_SID || !API_KEY || !API_SECRET) {
    console.error("Missing Twilio env vars");
    return res.status(500).json({ error: "Twilio env vars not set" });
  }

  const token = new AccessToken(
    ACCOUNT_SID,
    API_KEY,
    API_SECRET,
    { identity: "agent1" } // any string
  );

  const voiceGrant = new VoiceGrant({
    // Your deployed Render URL + /voice
    outgoingApplicationSid: TWIML_APP_SID
  });

  token.addGrant(voiceGrant);

  res.json({ token: token.toJwt() });
});

// /voice -> Twilio webhook, this actually dials the number
app.post("/voice", (req, res) => {
  console.log("VOICE WEBHOOK HIT:", req.body);

  const twiml = new twilio.twiml.VoiceResponse();
  const to = req.body.To;

  if (!CALLER_ID) {
    console.error("CALLER_ID not set");
    twiml.say("Server error: caller ID not configured.");
  } else if (to) {
    twiml.dial({ callerId: CALLER_ID }, to);
  } else {
    twiml.say("No destination number provided.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on port " + port);
});
