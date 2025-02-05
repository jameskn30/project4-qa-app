import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
    data: string | string[],
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET' && req.query.roomId) {
    const chatApiEndpoint = process.env.CHATAPI_ENDPOINT || null;
    const roomId = req.query.roomId;
    try {
      const response = await fetch(`${chatApiEndpoint}/list_members/${roomId}`);
      const data = await response.json();
      console.log(data)
      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(400).json({ data: 'Error retrieving members' });
    }
  } else {
    res.status(400).json({ data: 'Invalid request' });
  }
}
