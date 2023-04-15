import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { createAccountForPKP, sendTxForPKP } from "../utils/pkp";
import {
  mintPkpUsingRelayerGoogleAuthVerificationEndpoint,
  pollRequestUntilTerminalState,
} from "../utils/pkp/googleAuth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { publicEnv } from "../env";
type CredentialResponse = any;

export default function Signup() {
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
  const [status, setStatus] = useState("");

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

  return (
    <>
      <GoogleLogin
        onSuccess={handleLoggedInToGoogle}
        onError={() => {
          console.log("Login Failed");
        }}
        useOneTap
      />
    </>
  );
}
