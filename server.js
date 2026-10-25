const WebSocket = require('ws');
const http = require('http');
const server = http.createServer((req,res)=>{
  res.writeHead(200);
  res.end("FREE WORLD ONLINE");
});
const wss = new WebSocket.Server({ server });
let players = {};
wss.on('connection', ws=>{
  ws.on('message', msg=>{
    try{
      const data = JSON.parse(msg);
      if(data.type==='join_free' || data.type==='join'){
        ws.id = data.id || "P"+Math.floor(Math.random()*99999);
        ws.room = data.room || "FREE";
        if(!players[ws.room]) players[ws.room] = {};
        players[ws.room][ws.id] = {id:ws.id, x:2500+Math.random()*800, y:2000+Math.random()*800};
      }
      if(data.type==='move'){
        if(players[data.room] && players[data.room][data.id]){
          players[data.room][data.id].x=data.x;
          players[data.room][data.id].y=data.y;
        }
      }
      let room = data.room || ws.room || "FREE";
      if(players[room]){
        let list = Object.values(players[room]);
        wss.clients.forEach(client=>{
          if(client.readyState===1 && client.room===room){
            client.send(JSON.stringify({players:list}));
          }
        });
      }
    }catch(e){}
  });
  ws.on('close', ()=>{
    for(let r in players) if(players[r][ws.id]) delete players[r][ws.id];
  });
});
const PORT = process.env.PORT || 10000;
server.listen(PORT);
