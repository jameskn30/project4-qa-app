import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
    websocketUrl: string,
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET' && req.query.roomId && req.query.username) {
    //TODO: forward request to retrieve the websocket url, 
    // meant to authorize the websocket URL but if user is authorized once, 
    // they'll have the  Websocket URL forever, think up a solution to this
    // currently, the next.js app not really a http-proxy, the client
    // still connects directly to the fastapi backend anyway
    const chatApiEndpoint = process.env.CHATAPI_ENDPOINT || null;
    const roomId = req.query.roomId;
    const username = req.query.username;

    res.status(200).json({ websocketUrl: `${chatApiEndpoint}/join/${roomId}/${username}` });
  } else {
    res.status(400).json({ websocketUrl: 'null' });
  }
}
