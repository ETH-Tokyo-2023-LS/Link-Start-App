import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../components/IconButton";
import { createAccountForPKP, sendTxForPKP } from "../utils/pkp";
import { useLocalStorage } from "../hooks/useLocalStorage";

type CredentialResponse = any;

export default function Wallet() {
  const [registeredPkpEthAddress, setRegisteredPkpEthAddress] = useLocalStorage(
    "registeredPkpEthAddress",
    ""
  );
  const [googleCredentialResponse, setGoogleCredentialResponse] =
    useLocalStorage<CredentialResponse | null>(
      "googleCredentialResponse",
      null
    );
  const [registeredPkpPublicKey, setRegisteredPkpPublicKey] =
    useLocalStorage<string>("registeredPkpPublicKey", "");
  const [authenticatedPkpPublicKey, setAuthenticatedPkpPublicKey] =
    useLocalStorage<string>("authenticatedPkpPublicKey", "");
  const [aaConuractAddress, setAaConuractAddress] = useLocalStorage(
    "aaConuractAddress",
    ""
  );
  const [toAddress, setToAddress] = useState("");
  const [value, setValue] = useState(0);
  const [hash, setHash] = useState("");

  useEffect(() => {
    (async () => {
      if (!registeredPkpPublicKey || !googleCredentialResponse) return;

      const result = await createAccountForPKP(
        registeredPkpPublicKey,
        googleCredentialResponse.credential
      );
      setAaConuractAddress(result);
    })();
  }, [registeredPkpPublicKey, googleCredentialResponse]);

  const signout = () => {
    setGoogleCredentialResponse(null);
    setRegisteredPkpEthAddress("");
    setRegisteredPkpPublicKey("");
    setAuthenticatedPkpPublicKey("");
    setAaConuractAddress("");
    setToAddress("");
    setValue(0);
    setHash("");
  };

  const withdrawETH = async (to: string, value: number) => {
    if (!registeredPkpPublicKey) return;

    const result = await sendTxForPKP(
      registeredPkpPublicKey,
      to,
      value,
      "0x",
      googleCredentialResponse.credential,
      false
    );
    if (result) setHash(result);
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
      {registeredPkpEthAddress && (
        <div>
          Registered PKP Eth Address (Lit Protocol):
          <p className="white">{registeredPkpEthAddress}</p>
        </div>
      )}
      {aaConuractAddress && (
        <div>
          My AA wallet address:
          <p className="white">{aaConuractAddress}</p>
        </div>
      )}
      {hash && (
        <div>
          hash:
          <p className="white">{hash}</p>
        </div>
      )}
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

      <button onClick={signout}>signout</button>
    </>
  );
}
