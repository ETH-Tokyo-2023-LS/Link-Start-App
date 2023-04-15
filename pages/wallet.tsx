import { useEffect, useState } from "react";
import { sendRestApi } from "../utils/sendRestApi";
import { sendETH } from "../utils/account";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "../components/IconButton";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";

export default function Wallet() {
  const [myAddress, setMyAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [value, setValue] = useState(0);
  const [hash, setHash] = useState("");

  useEffect(() => {
    (async () => {
      const result = await sendRestApi("/api/account/create", "POST", {
        body: {},
      });
      setMyAddress(result.account);
    })();
  }, []);

  const withdrawETH = async (to: string, value: number) => {
    const result = await sendETH(to, value, false);
    setHash(result);
  };

  const handleToAddressChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setToAddress(event.target.value);
  };

  const handleValueChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setValue(Number(event.target.value));
  };

  return (
    <>
      <div>wallet page</div>
      <p className="text-gray-600">{myAddress}</p>
      <p className="text-gray-600">{hash}</p>

      <input
        type="text"
        value={toAddress}
        onChange={handleToAddressChange}
        className="w-full py-2 px-3 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
      />

      <input
        type="number"
        value={value}
        onChange={handleValueChange}
        className="w-full py-2 px-3 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
      />

      <IconButton
        icon={<FontAwesomeIcon icon={faExchangeAlt} />}
        title="Withdraw"
        subTitle="ETH"
        onClick={() => withdrawETH(toAddress, value)}
      />
    </>
  );
}
