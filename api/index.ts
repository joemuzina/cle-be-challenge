import { VercelRequest, VercelResponse } from "@vercel/node";

export default (request: VercelRequest, response: VercelResponse) => {
    return response.json({ message: 'Hello World' })
};
