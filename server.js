app.get("/token", (req, res) => {
  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const voiceGrant = new VoiceGrant({
    voiceUrl: "https://twilio-web-dialer-af3y.onrender.com/voice"
  });

  const token = new AccessToken(
    process.env.ACCOUNT_SID,
    process.env.API_KEY,
    process.env.API_SECRET,
    { identity: "agent1" }
  );

  token.addGrant(voiceGrant);

  res.json({ token: token.toJwt() });
});
