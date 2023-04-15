import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "../components/IconButton";
import { createAccountForPKP, sendTxForPKP } from "../utils/pkp";

type CredentialResponse = any;

const RELAY_API_URL = process.env.REACT_APP_RELAY_API_URL || "";
const RELAY_API_KEY = process.env.REACT_APP_RELAY_API_KEY || "";

export default function Wallet() {
  const [registeredPkpEthAddress, setRegisteredPkpEthAddress] =
    useState<string>("");
  const [googleCredentialResponse, setGoogleCredentialResponse] =
    useState<CredentialResponse | null>(null);
  const [registeredPkpPublicKey, setRegisteredPkpPublicKey] =
    useState<string>("");
  const [authenticatedPkpPublicKey, setAuthenticatedPkpPublicKey] =
    useState<string>("");
  const [status, setStatus] = useState("");

  const [myAddress, setMyAddress] = useState("");
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
      setMyAddress(result);
    })();
  }, [registeredPkpPublicKey, googleCredentialResponse]);

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

  const handleLoggedInToGoogle = async (
    credentialResponse: CredentialResponse
  ) => {
    console.log("Got response from google sign in: ", {
      credentialResponse,
    });
    setGoogleCredentialResponse(credentialResponse);
    const requestId = await mintPkpUsingRelayerGoogleAuthVerificationEndpoint(
      credentialResponse,
      setStatus
    );
    await pollRequestUntilTerminalState(
      requestId,
      setStatus,
      ({ pkpEthAddress, pkpPublicKey }) => {
        setRegisteredPkpEthAddress(pkpEthAddress);
        setRegisteredPkpPublicKey(pkpPublicKey);
      }
    );
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
      <GoogleLogin
        onSuccess={handleLoggedInToGoogle}
        onError={() => {
          console.log("Login Failed");
        }}
        useOneTap
      />
      {registeredPkpEthAddress && (
        <div>Registered PKP Eth Address: {registeredPkpEthAddress}</div>
      )}

      {/*<button onClick={() => handleAction(registeredPkpPublicKey)}>
        Encrypt with Lit
      </button> */}

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

async function mintPkpUsingRelayerGoogleAuthVerificationEndpoint(
  credentialResponse: any,
  setStatusFn: (status: string) => void
) {
  setStatusFn("Minting PKP with relayer...");

  const mintRes = await fetch(`${RELAY_API_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": RELAY_API_KEY,
    },
    body: JSON.stringify({
      idToken: credentialResponse.credential,
    }),
  });

  if (mintRes.status < 200 || mintRes.status >= 400) {
    console.warn("Something wrong with the API call", await mintRes.json());
    setStatusFn("Uh oh, something's not quite right.");
    return null;
  } else {
    const resBody = await mintRes.json();
    console.log("Response OK", { body: resBody });
    setStatusFn("Successfully initiated minting PKP with relayer.");
    return resBody.requestId;
  }
}

async function pollRequestUntilTerminalState(
  requestId: string,
  setStatusFn: (status: string) => void,
  onSuccess: ({
    pkpEthAddress,
    pkpPublicKey,
  }: {
    pkpEthAddress: string;
    pkpPublicKey: string;
  }) => void
) {
  if (!requestId) {
    return;
  }

  const maxPollCount = 20;
  for (let i = 0; i < maxPollCount; i++) {
    setStatusFn(`Waiting for auth completion (poll #${i + 1})`);
    const getAuthStatusRes = await fetch(
      `${RELAY_API_URL}/auth/status/${requestId}`,
      {
        headers: {
          "api-key": RELAY_API_KEY,
        },
      }
    );

    if (getAuthStatusRes.status < 200 || getAuthStatusRes.status >= 400) {
      console.warn(
        "Something wrong with the API call",
        await getAuthStatusRes.json()
      );
      setStatusFn("Uh oh, something's not quite right.");
      return;
    }

    const resBody = await getAuthStatusRes.json();
    console.log("Response OK", { body: resBody });

    if (resBody.error) {
      // exit loop since error
      console.warn("Something wrong with the API call", {
        error: resBody.error,
      });
      setStatusFn("Uh oh, something's not quite right.");
      return;
    } else if (resBody.status === "Succeeded") {
      // exit loop since success
      console.info("Successfully authed", { ...resBody });
      setStatusFn("Successfully authed and minted PKP!");
      onSuccess({
        pkpEthAddress: resBody.pkpEthAddress,
        pkpPublicKey: resBody.pkpPublicKey,
      });
      return;
    }

    // otherwise, sleep then continue polling
    await new Promise((r) => setTimeout(r, 15000));
  }

  // at this point, polling ended and still no success, set failure status
  setStatusFn(`Hmm this is taking longer than expected...`);
}
