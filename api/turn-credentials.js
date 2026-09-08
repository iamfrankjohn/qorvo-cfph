const crypto = require('crypto');

module.exports = function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  const host=process.env.TURN_HOST;
  const secret=process.env.TURN_AUTH_SECRET;
  if(!host || !secret){
    return res.status(200).json({
      configured:false,
      iceServers:[
        {urls:'stun:stun.l.google.com:19302'},
        {urls:'stun:stun1.l.google.com:19302'}
      ]
    });
  }

  const ttl=Number(process.env.TURN_CREDENTIAL_TTL || 3600);
  const username=`${Math.floor(Date.now()/1000)+ttl}:qorvo`;
  const credential=crypto.createHmac('sha1',secret).update(username).digest('base64');

  const iceServers=[
    {urls:'stun:stun.l.google.com:19302'},
    {urls:'stun:stun1.l.google.com:19302'},
    {
      urls:[
        `turn:${host}:3478?transport=udp`,
        `turn:${host}:3478?transport=tcp`
      ],
      username,
      credential
    }
  ];
  return res.status(200).json({configured:true,iceServers,expiresIn:ttl});
};
