const express = require("express");
const twilio = require("twilio");

/* CREATE APP FIRST */
const app = express();

/* MIDDLEWARE */
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

/* ENVIRONMENT VARIABLES */
const ACCOUNT_SID = process.env.ACCOUNT_SID;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const CALLER_ID = process.env.CALLER_ID;

/* SIMPLE START LOG (CONFIRMS DEPLOY) */
console.log("SERVER STARTED – FINAL VERSION");

/* TOKEN ENDPOINT FOR BROWSER */
app.get("/token", (req, res) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const voiceGrant = new VoiceGrant({
    voiceUrl: "https://twilio-web-dialer-af3y.onrender.com/voice"
  });

  const token = new AccessToken(
    ACCOUNT_SID,
    API_KEY,
    API_SECRET,
    { identity: "agent1" }
  );

  token.addGrant(voiceGrant);

  res.json({ token: token.toJwt() });
});

/* VOICE WEBHOOK – THIS ACTUALLY DIALS */
app.post("/voice", (req, res) => {
  console.log("VOICE WEBHOOK HIT", req.body);

  const twiml = new twilio.twiml.VoiceResponse();
  const to = req.body.To;

  if (to) {
    twiml.dial({ callerId: CALLER_ID }, to);
  } else {
    twiml.say("No destination number provided");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

/* START SERVER */
app.listen(process.env.PORT || 3000, () => {
  console.log("Server listening");
});
