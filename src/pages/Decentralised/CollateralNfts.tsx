import { ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import {
  exchangeAddressFromId,
  getCollateralNfts,
} from "../../signedContracts/signedC";
import abiExchange from "../../contracts/decentralised/exchange.json";
import { Stack, Box, Button, Grid, Input } from "@mui/material";
import NftCard from "../../components/NftCard";

let provider: any;
let exchangeContract: any;

export default function CollateralNfts() {
  const collateralTokenId = useRef<HTMLInputElement>(null);
  const collateralPrice = useRef<HTMLInputElement>(null);
  const [collateralNfts, setCollateralNfts] = useState<
    | [
        {
          name: string;
          description: string;
          image: string;
          tokenId: Number;
          borrower: string;
          price: string;
        }
      ]
    | null
  >(null);

  const getCollateralHandler = async function (
    e: any,
    borrower: string,
    price: string
  ) {
    const tx = await exchangeContract.buyCollateralNft(borrower, {
      value: String(price),
    });
  };
  useEffect(() => {
    (async function () {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      const chainIdString = String(chainId);
      setCollateralNfts(await getCollateralNfts(chainIdString));
      const signer = await provider.getSigner();
      exchangeContract = new ethers.Contract(
        exchangeAddressFromId.get(chainIdString)!,
        abiExchange.abi,
        signer
      );
    })();
  }, []);

  return (
    <Box>
      <Box>
        <Grid container sx={{ m: 2 }} gap={2}>
          {collateralNfts?.map((i) => (
            <Grid item container direction="column" key={i.image}>
              <Stack alignItems={"center"} spacing={2}>
                <NftCard
                  image={i.image}
                  desc={i.description}
                  name={i.name}
                  price={String(i.price)}
                ></NftCard>
                <Button
                  onClick={(e) => {
                    getCollateralHandler(e, i.borrower, i.price);
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
