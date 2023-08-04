import { Button, Grid, Stack, Typography } from "@mui/material";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import {
  exchangeAddressFromIdCentralised,
  getCollateralNfts,
  getSignedNftContract,
} from "../../signedContracts/scriptsCentralised";
import NftCardCentralised from "../../components/NftCardCentralised";
import { MyContext } from "../../MyContext";
import { ethers } from "ethers";
import abiExchangeCentralised from "../../contracts/centralised/exchange.json";

export default function CollateralNfts() {
  const { acc, setDialogueText, chainId, setLoading } = useContext(MyContext);

  async function changeNetwork(chainId: string) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0x" + String(Number(chainId).toString(16)),
          },
        ],
      });
    } catch (e) {
      setDialogueText("Transaction Failed!");
      window.location.reload();
    }
  }
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
    | []
  >(null);

  useEffect(() => {
    (async function () {
      setCollateralNfts(await getCollateralNfts());
    })();
  }, []);

  const getCollateralHandler = async function (
    e: React.MouseEvent<HTMLElement>,
    network: string,
    price: string,
    tokenId: string
  ) {
    setLoading(true);
    try {
      changeNetwork(network);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const exchangeContract = new ethers.Contract(
        exchangeAddressFromIdCentralised.get(chainId)!,
        abiExchangeCentralised.abi,
        signer
      );
      const tranferTx = await exchangeContract.acceptEth({
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
      setCollateralNfts(null);
      setCollateralNfts(await getCollateralNfts());
    } catch (e) {
      setDialogueText("Buy Transaction Failed.");
    }
    setLoading();
  };

  return (
    <Stack alignItems={"center"} sx={{ mt: 8 }} spacing={2}>
      {collateralNfts == null && (
        <Typography variant={"h3"}>Loading Collateral NFTs ...</Typography>
      )}
      {collateralNfts?.length == 0 && (
        <Stack alignItems={"center"} spacing={2}>
          <Typography variant={"h3"}>No NFts for sale currently.</Typography>
          <Typography variant={"h3"}>Please come back again later.</Typography>
        </Stack>
      )}
      <Stack alignItems={"center"} spacing={2}>
        {collateralNfts?.map((i) => (
          <Grid direction="column" key={i.image}>
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
      </Stack>
    </Stack>
  );
}
