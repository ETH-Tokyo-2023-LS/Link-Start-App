import { NextApiRequest, NextApiResponse } from "next";
import { sendTx } from "../../../utils/account";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  switch (method) {
    case "POST":
      const { to, value, data, withPaymaster } = body;
      if (!to || !value || !data || withPaymaster === undefined)
        return res.status(400).json({ ok: false, message: "Bad Request" });

      const hash = await sendTx(to, value, data, withPaymaster);
      res.status(200).json({ ok: true, hash });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
