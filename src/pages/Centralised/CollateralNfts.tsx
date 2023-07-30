import { Box, Button, Grid, Stack } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import {
  getCollateralNfts,
  getSignedNftContract,
} from "../../signedContracts/scriptsCentralised";
import NftCardCentralised from "../../components/NftCardCentralised";
import { MyContext } from "../../MyContext";

export default function CollateralNfts() {
  const { acc, exchangeContractCentralised, changeNetwork } =
    useContext(MyContext);

  const [collateralNfts, setCollateralNfts] = useState<
    | [
        {
          name: string;
          description: string;
          image: string;
          tokenId: string;
          network: string;
          price: string;
          borrower: string;
        }
      ]
    | null
  >(null);

  useEffect(() => {
    (async function () {
      setCollateralNfts(await getCollateralNfts());
    })();
  }, []);

  const getCollateralHandler = async function (
    e: any,
    network: string,
    price: string,
    tokenId: string
  ) {
    changeNetwork(network);
    const tranferTx = await exchangeContractCentralised.acceptEth({
      value: price,
    });
    console.log(await tranferTx.wait());
    const nftContract = await getSignedNftContract(network);
    const nftTransTx = await nftContract.transferFrom(
      "0xe24fB10c138B1eB28D146dFD2Bb406FAE55176b4",
      acc,
      String(tokenId)
    );
    const recTx = await nftTransTx.wait();
    console.log(recTx);
  };

  return (
    <Box>
      <Box>
        <Grid container sx={{ m: 2 }} gap={2}>
          {collateralNfts?.map((i) => (
            <Grid item container direction="column" key={i.image}>
              <Stack alignItems={"center"} spacing={2}>
                <NftCardCentralised
                  image={i.image}
                  desc={i.description}
                  name={i.name}
                  price={String(i.price)}
                  network={i.network}
                ></NftCardCentralised>
                <Button
                  onClick={(e) => {
                    getCollateralHandler(
                      e,
                      i.network,
                      String(i.price),
                      i.tokenId
                    );
                  }}
                  sx={{
                    width: "fit-content",
                  }}
                  variant="contained"
                >
                  Buy
                </Button>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
