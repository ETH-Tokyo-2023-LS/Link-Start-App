import { useEffect, useState } from "react";
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

  const [isOpen, setIsOpen] = useBoolean();
  const [isLoading, setIsLoading] = useBoolean();

  useEffect(() => {
    (async () => {
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
      <Stack
        spacing="4"
        maxW="1000px"
        minW={["100%", "600px"]}
        p="10"
        bg="whtie"
      >
        <Stack
          spacing="8"
          p="6"
          borderRadius="lg"
          boxShadow="md"
          border="2px"
          borderColor="blackAlpha.50"
        >
          <Stack spacing="1" direction="row">
            <Stack
              spacing="4"
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              <Avatar
                src={`https://source.boringavatars.com/marble/300/${aaConuractAddress}?square=false&colors=ff548f,9061c2,be80ff,63d3ff,02779e`}
                boxSize="16"
              />

              <Stack spacing="0">
                <Text fontSize="md" fontWeight="medium" color="blackAlpha.500">
                  My AA wallet
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="black">
                  {shortenAddress(aaConuractAddress)}
                </Text>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          spacing="4"
          p="6"
          borderRadius="lg"
          boxShadow="md"
          border="2px"
          borderColor="blackAlpha.50"
        >
          <Stack spacing="0">
            <Text fontSize="md" fontWeight="medium" color="blackAlpha.500">
              Balance
            </Text>
            <Text fontSize="4xl" fontWeight="bold" color="black">
              {balance}
            </Text>
          </Stack>

          <Stack direction="row" w="100%">
            <Button
              w="100%"
              colorScheme="blue"
              size="lg"
              onClick={() => alert("t")}
            >
              Deposit
            </Button>
            <Button
              w="100%"
              colorScheme="blue"
              size="lg"
              onClick={() => setIsOpen.on()}
            >
              Withdraw
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Modal isOpen={isOpen} onClose={() => setIsOpen.off()}>
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
            onClick={() => setIsOpen.off()}
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
                colorScheme="blue"
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
