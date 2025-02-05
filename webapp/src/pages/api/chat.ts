import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
    websocketUrl: string,
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET' && req.query.roomId) {
    const chatApiEndpoint = process.env.CHATAPI_ENDPOINT || 'Not set';
    const roomId = req.query.roomId;
    res.status(200).json({ websocketUrl: `${chatApiEndpoint}/join/${roomId}` });
  } else {
    res.status(400).json({ websocketUrl: 'null' });
  }
}
