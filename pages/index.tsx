import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useBoolean } from "@chakra-ui/react";
import { Spinner } from "../components/Spinner";
import { GoogleLogin } from "@react-oauth/google";
import { createAccountForPKP } from "../utils/pkp";
import {
  mintPkpUsingRelayerGoogleAuthVerificationEndpoint,
  pollRequestUntilTerminalState,
} from "../utils/pkp/googleAuth";
import { useLocalStorage } from "../hooks/useLocalStorage";

type CredentialResponse = any;

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();
  const [doorOpen, setDoorOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [zoomOut, setZoomOut] = useState(false);
  const [isLoading, setIsLoading] = useBoolean();

  const handleSuccess = () => {
    setZoomOut(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      router.push("/wallet");
    }, 2000);
  };

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
  const googleLoginButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    (async () => {
      if (!registeredPkpPublicKey || !googleCredentialResponse) return;
      const result = await createAccountForPKP(
        registeredPkpPublicKey,
        googleCredentialResponse.credential
      );
      setAaConuractAddress(result);

      if (registeredPkpPublicKey && googleCredentialResponse && result) {
        setIsLoading.off();
        setDoorOpen(true);
        handleSuccess();
      }
    })();
  }, [registeredPkpPublicKey, googleCredentialResponse]);

  const handleLoggedInToGoogle = async (
    credentialResponse: CredentialResponse
  ) => {
    setIsLoading.on();
    console.log("Got response from google sign in: ", {
      credentialResponse,
    });
    setGoogleCredentialResponse(credentialResponse);
    const requestId = await mintPkpUsingRelayerGoogleAuthVerificationEndpoint(
      credentialResponse.credential,
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

  // const login = useGoogleLogin({
  //   onSuccess: handleLoggedInToGoogle,
  //   onError: () => {
  //     window.alert("Login Failed");
  //   },
  // });

  return (
    <div
      className={`${inter.className} ${!doorOpen ? "bg-[#ccc]" : "inherit"}`}
    >
      {isLoading ? (
        <div className="min-h-screen min-w-full flex flex-col items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {!isLoggedIn && (
            <div className={zoomOut ? "zoom-out" : ""}>
              <div className="min-h-screen min-w-full flex flex-col items-center justify-center">
                {(doorOpen || zoomOut) && (
                  <Image
                    className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
                    src="/linkstart.png"
                    alt="Project Logo"
                    width={500}
                    height={300}
                    priority
                  />
                )}
                {!doorOpen && (
                  // <button
                  //   type="button"
                  //   onClick={() => {
                  //     setDoorOpen(true);

                  //     login();
                  //   }}
                  //   className="white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-xl rounded-lg text-sm px-10 py-5 text-center mr-2 mb-2"
                  // >
                  //   LINK START
                  // </button>
                  <GoogleLogin
                    onSuccess={handleLoggedInToGoogle}
                    onError={() => {
                      console.log("Login Failed");
                    }}
                    useOneTap
                  />
                )}

                {doorOpen && (
                  <div className="door-animation">
                    <div className="left-door"></div>
                    <div className="right-door"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
