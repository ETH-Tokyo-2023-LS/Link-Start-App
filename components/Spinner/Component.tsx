/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import {
  Stack,
  Spinner as ChakraSpinner,
  SpinnerProps as ChakraSpinnerProps,
  useColorModeValue,
} from "@chakra-ui/react";

export type SpinnerProps = ChakraSpinnerProps;

const Component: React.FC<SpinnerProps> = (props) => {
  return (
    <Stack w="full" alignItems="center" justifyContent="center">
      <ChakraSpinner
        size="md"
        color={useColorModeValue("blackAlpha.300", "whiteAlpha.400")}
        speed="0.5s"
        thickness="3px"
        {...props}
      />
    </Stack>
  );
};

export default Component;
