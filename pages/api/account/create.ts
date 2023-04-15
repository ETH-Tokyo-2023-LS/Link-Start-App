import { NextApiRequest, NextApiResponse } from "next";
import { createAccount } from "../../../utils/account";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST":
      const { message } = req.body;
      console.log(message);
      const account = await createAccount();
      res.status(200).json({ ok: true, account });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
