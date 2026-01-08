const express = require("express");
const twilio = require("twilio");
const app = express();

app.use(express.static("public"));

const ACCOUNT_SID = process.env.ACCOUNT_SID;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const APP_SID = process.env.APP_SID;

app.get("/token", (req, res) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(
    ACCOUNT_SID,
    API_KEY,
    API_SECRET,
    { identity: "agent1" }
  );

  token.addGrant(
    new VoiceGrant({
      outgoingApplicationSid: APP_SID,
      incomingAllow: true
    })
  );

  res.json({ token: token.toJwt() });
});

app.listen(process.env.PORT || 3000);
