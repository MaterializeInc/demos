import * as React from "react";
import { ChakraProvider, Box, Text } from "@chakra-ui/react";

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import AntennasMap from "./components/AntennasMap";
import link from "./link";
import theme from "./theme";

const client = new ApolloClient({
  uri: "backend:4000/graphql",
  cache: new InMemoryCache(),
  link,
});

export const App = () => (
  <ApolloProvider client={client}>
    <ChakraProvider theme={theme}>
      <Box
        textAlign="center"
        fontSize="xl"
        height={"100vh"}
        overflow={"hidden"}
        paddingTop={"2rem"}
      >
        <Text fontSize="5xl" marginBottom={"5rem"}>
          🗽 Manhattan 5G Antennas Performance
        </Text>
        <AntennasMap />
      </Box>
    </ChakraProvider>
  </ApolloProvider>
);
