const express = require("express");
const twilio = require("twilio");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

app.get("/token", (req, res) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: "unused"
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

/* THIS IS THE KEY FIX */
app.post("/voice", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const to = req.body.To;

  if (to) {
    twiml.dial(to);
  } else {
    twiml.say("No destination number provided");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(process.env.PORT || 3000);
