import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  IconButton,
  useBoolean,
  useColorModeValue,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";
import { createAccountForPKP, sendTxForPKP } from "../utils/pkp";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { getNativeAssetBalanceForAlchemy } from "../utils/alchemy";
import { ethers } from "ethers";
import { MobileHeader } from "@/components/MobileHeader";

type CredentialResponse = any;

export const shortenAddress = (address: string): string => {
  if (typeof window === "undefined") return "";
  if (address.length > length) {
    const frontAddressSubstring = address.substring(0, 6);
    const backAddressSubstring = address.substring(address.length - 4);
    return `${frontAddressSubstring}...${backAddressSubstring}`;
  }
  return address;
};

export default function Wallet() {
  const router = useRouter();
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
  const [balance, setBalance] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [value, setValue] = useState(0);
  const [hash, setHash] = useState("");

  const [isOpenDeposit, setIsOpenDeposit] = useBoolean();
  const [isOpenWithdraw, setIsOpenWithdraw] = useBoolean();
  const [isLoading, setIsLoading] = useBoolean();

  useEffect(() => {
    (async () => {
      if (!aaConuractAddress || !registeredPkpPublicKey) router.push("/");

      const result = await getNativeAssetBalanceForAlchemy(
        "5",
        aaConuractAddress
      );
      setBalance(result);
      console.log("balance", aaConuractAddress, result);
    })();
  }, []);

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

  const depositETH = async (from: string, value: number) => {
    if (!registeredPkpPublicKey) return;
    setIsLoading.on();

    // const result = await ethers.(
    //   registeredPkpPublicKey,
    //   to,
    //   value,
    //   "0x",
    //   googleCredentialResponse.credential,
    //   false
    // );
    // if (result) setHash(result);
    setIsLoading.off();
  };

  const withdrawETH = async (to: string, value: number) => {
    if (!registeredPkpPublicKey) return;
    setIsLoading.on();

    const result = await sendTxForPKP(
      registeredPkpPublicKey,
      to,
      value,
      "0x",
      googleCredentialResponse.credential,
      false
    );
    if (result) setHash(result);
    setIsLoading.off();
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
    <Stack w="100%" alignItems="center" justifyContent="center">
      <MobileHeader />
      <Stack
        // spacing="4"
        // maxW="1000px"
        // minW={["100%", "600px"]}
        p={["6", "10"]}
        bg="whtie"
      >
        <Stack
          spacing="8"
          // p="6"
          borderRadius="lg"
          border="2px"
          borderColor="blackAlpha.50"
        >
          <Stack spacing="3" direction="row">
            <Stack
              spacing="6"
              direction="column"
              alignItems="center"
              justifyContent="center"
              w="100%"
            >
              <Stack
                spacing="4"
                alignItems="center"
                justifyContent="center"
                w="100%"
              >
                <Avatar
                  src={`https://source.boringavatars.com/marble/300/${aaConuractAddress}?square=false&colors=ff548f,9061c2,be80ff,63d3ff,02779e`}
                  boxSize="28"
                />
                <Stack spacing="0" alignItems="center" justifyContent="center">
                  <Text fontSize="2xl" fontWeight="bold" color="black">
                    {"User Name"}
                  </Text>
                  <Text
                    fontSize="lg"
                    fontWeight="medium"
                    color="blackAlpha.500"
                  >
                    {"@socialid"}
                  </Text>
                </Stack>
              </Stack>

              <Stack
                spacing="4"
                direction={["column", "row"]}
                alignItems="center"
                justifyContent="center"
                w="100%"
              >
                <Stack
                  spacing="1"
                  p="6"
                  w="100%"
                  borderRadius="lg"
                  bgColor="blackAlpha.50"
                >
                  <Text
                    fontSize="md"
                    fontWeight="medium"
                    color="blackAlpha.500"
                  >
                    My AA wallet
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="black">
                    {shortenAddress(aaConuractAddress)}
                  </Text>
                </Stack>

                <Stack
                  spacing="1"
                  p="6"
                  w="100%"
                  borderRadius="lg"
                  bgColor="blackAlpha.50"
                >
                  <Text
                    fontSize="md"
                    fontWeight="medium"
                    color="blackAlpha.500"
                  >
                    PKP public key
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="black">
                    {shortenAddress(registeredPkpPublicKey)}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          spacing="4"
          p="6"
          borderRadius="lg"
          border="2px"
          borderColor="blackAlpha.50"
        >
          <Stack spacing="0">
            <Text fontSize="md" fontWeight="medium" color="blackAlpha.500">
              Balance
            </Text>
            <Text fontSize="4xl" fontWeight="bold" color="black">
              {balance} ETH
            </Text>
          </Stack>

          <Stack spacing="4" direction="row" w="100%">
            <div className="flex justify-center w-full">
              <button
                type="button"
                onClick={() => setIsOpenDeposit.on()}
                className="min-w-[100%] mt-10 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-xl rounded-lg text-sm px-10 py-5 text-center mr-2 mb-2"
              >
                <Text fontSize="lg" fontWeight="bold">
                  Deposit
                </Text>
              </button>
            </div>

            <div className="flex justify-center w-full">
              <button
                type="button"
                onClick={() => setIsOpenWithdraw.on()}
                className="min-w-[100%] mt-10 text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-xl rounded-lg text-sm px-10 py-5 text-center mr-2 mb-2"
              >
                <Text fontSize="lg" fontWeight="bold">
                  Withdraw
                </Text>
              </button>
            </div>
          </Stack>
        </Stack>
      </Stack>

      <Modal isOpen={isOpenDeposit} onClose={() => setIsOpenDeposit.off()}>
        <ModalOverlay />
        <ModalContent
          px="4px"
          pt="12px"
          pb="20px"
          mt="17vh"
          mx="4"
          borderRadius="2xl"
          bgColor={useColorModeValue("white", "#202020")}
        >
          <ModalHeader pt="10px" pb="8px">
            <Text fontSize="xl" fontWeight="bold">
              Deposit
            </Text>
          </ModalHeader>
          <ModalCloseButton
            as={IconButton}
            variant="outline"
            colorScheme="gray"
            minW="0"
            w="36px"
            h="36px"
            mt="14px"
            mx="14px"
            borderRadius="full"
            onClick={() => setIsOpenDeposit.off()}
            aria-label="Modal"
            color={useColorModeValue("blackAlpha.800", "whiteAlpha.800")}
            bgColor="transparent"
            _active={{
              boxShadow: "none",
              borderColor: useColorModeValue(
                "blackAlpha.100",
                "whiteAlpha.100"
              ),
              bg: useColorModeValue("blackAlpha.50", "whiteAlpha.50"),
              color: useColorModeValue("blackAlpha.700", "whiteAlpha.700"),
            }}
            _hover={{
              boxShadow: "none",
              borderColor: useColorModeValue(
                "blackAlpha.100",
                "whiteAlpha.100"
              ),
              bg: useColorModeValue("blackAlpha.50", "whiteAlpha.50"),
              color: useColorModeValue("blackAlpha.700", "whiteAlpha.700"),
            }}
            _focus={{
              boxShadow: "none",
              borderColor: useColorModeValue(
                "blackAlpha.100",
                "whiteAlpha.100"
              ),
              bg: useColorModeValue("blackAlpha.50", "whiteAlpha.50"),
              color: useColorModeValue("blackAlpha.700", "whiteAlpha.700"),
            }}
          />
          <ModalBody bgColor={useColorModeValue("white", "none")}>
            <Stack spacing="6">
              <FormControl id="to">
                <FormLabel>From Address</FormLabel>
                <Stack
                  spacing="1"
                  p="6"
                  w="100%"
                  borderRadius="lg"
                  bgColor="blackAlpha.50"
                >
                  <Text>{aaConuractAddress}</Text>
                </Stack>
              </FormControl>
              {/* <Stack spacing="4">
                <FormControl id="to">
                  <FormLabel>To Address</FormLabel>
                  <Input
                    size="lg"
                    type="text"
                    value={toAddress}
                    onChange={handleToAddressChange}
                  />
                </FormControl>

                <FormControl id="amount">
                  <FormLabel>Amount</FormLabel>
                  <Input
                    size="lg"
                    type="number"
                    value={value}
                    onChange={handleValueChange}
                  />
                </FormControl>
              </Stack> */}

              {/* <Button
                w="100%"
                size="lg"
                colorScheme="blue"
                onClick={() => withdrawETH(toAddress, value)}
                isLoading={isLoading}
              >
                Send
              </Button> */}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Button w="100%" size="lg" colorScheme="blue" onClick={() => signout()}>
        signout
      </Button>

      <Modal isOpen={isOpenWithdraw} onClose={() => setIsOpenWithdraw.off()}>
        <ModalOverlay />
        <ModalContent
          px="4px"
          pt="12px"
          pb="20px"
          mt="17vh"
          mx="4"
          borderRadius="2xl"
          bgColor={useColorModeValue("white", "#202020")}
        >
          <ModalHeader pt="10px" pb="8px">
            <Text fontSize="xl" fontWeight="bold">
              Withdraw
            </Text>
          </ModalHeader>
          <ModalCloseButton
            as={IconButton}
            variant="outline"
            colorScheme="gray"
            minW="0"
            w="36px"
            h="36px"
            mt="14px"
            mx="14px"
            borderRadius="full"
            onClick={() => setIsOpenWithdraw.off()}
            aria-label="Modal"
            color={useColorModeValue("blackAlpha.800", "whiteAlpha.800")}
            bgColor="transparent"
            _active={{
              boxShadow: "none",
              borderColor: useColorModeValue(
                "blackAlpha.100",
                "whiteAlpha.100"
              ),
              bg: useColorModeValue("blackAlpha.50", "whiteAlpha.50"),
              color: useColorModeValue("blackAlpha.700", "whiteAlpha.700"),
            }}
            _hover={{
              boxShadow: "none",
              borderColor: useColorModeValue(
                "blackAlpha.100",
                "whiteAlpha.100"
              ),
              bg: useColorModeValue("blackAlpha.50", "whiteAlpha.50"),
              color: useColorModeValue("blackAlpha.700", "whiteAlpha.700"),
            }}
            _focus={{
              boxShadow: "none",
              borderColor: useColorModeValue(
                "blackAlpha.100",
                "whiteAlpha.100"
              ),
              bg: useColorModeValue("blackAlpha.50", "whiteAlpha.50"),
              color: useColorModeValue("blackAlpha.700", "whiteAlpha.700"),
            }}
          />
          <ModalBody bgColor={useColorModeValue("white", "none")}>
            <Stack spacing="6">
              <Stack spacing="4">
                <FormControl id="to">
                  <FormLabel>To Address</FormLabel>
                  <Input
                    size="lg"
                    type="text"
                    value={toAddress}
                    onChange={handleToAddressChange}
                  />
                </FormControl>

                <FormControl id="amount">
                  <FormLabel>Amount</FormLabel>
                  <Input
                    size="lg"
                    type="number"
                    value={value}
                    onChange={handleValueChange}
                  />
                </FormControl>
              </Stack>

              <Button
                w="100%"
                size="lg"
                colorScheme="facebook"
                onClick={() => withdrawETH(toAddress, value)}
                isLoading={isLoading}
              >
                Send
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Stack>
  );
}
