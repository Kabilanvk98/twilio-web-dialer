// server.js
const express = require("express");
const twilio = require("twilio");
const app = express();

// Serve your public/index.html
app.use(express.static("public"));

// Parse Twilio webhook form data
app.use(express.urlencoded({ extended: false }));

// Environment variables
const ACCOUNT_SID = process.env.ACCOUNT_SID;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const CALLER_ID = process.env.CALLER_ID;
const TWIML_APP_SID = process.env.TWIML_APP_SID;

console.log("SERVER STARTED – WEB DIALER");

app.get("/token", (req, res) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    console.error("Missing Twilio env vars");
    return res.status(500).json({ error: "Twilio env vars not set" });
  }

  const token = new AccessToken(
    ACCOUNT_SID,
    ACCOUNT_SID,
    AUTH_TOKEN,
    { identity: "agent1" }
  );

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: TWIML_APP_SID
  });

  token.addGrant(voiceGrant);
  res.json({ token: token.toJwt() });
});

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server listening on port " + port);
});
