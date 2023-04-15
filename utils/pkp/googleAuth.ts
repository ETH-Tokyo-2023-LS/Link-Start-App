import { publicEnv } from "../../env";

export const mintPkpUsingRelayerGoogleAuthVerificationEndpoint = async (
  credentialResponse: any,
  setStatusFn: (status: string) => void
) => {
  setStatusFn("Minting PKP with relayer...");

  const mintRes = await fetch(`${publicEnv.relayApiUrl}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": publicEnv.relayApiKey,
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
};

export const pollRequestUntilTerminalState = async (
  requestId: string,
  setStatusFn: (status: string) => void,
  onSuccess: ({
    pkpEthAddress,
    pkpPublicKey,
  }: {
    pkpEthAddress: string;
    pkpPublicKey: string;
  }) => void
) => {
  if (!requestId) {
    return;
  }

  const maxPollCount = 20;
  for (let i = 0; i < maxPollCount; i++) {
    setStatusFn(`Waiting for auth completion (poll #${i + 1})`);
    const getAuthStatusRes = await fetch(
      `${publicEnv.relayApiUrl}/auth/status/${requestId}`,
      {
        headers: {
          "api-key": publicEnv.relayApiKey,
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
};
