import { useContext, useEffect, useState } from "react";
import { getCollateralNfts } from "../../signedContracts/scriptsDecentralised";
import { Stack, Box, Button, Grid, Typography } from "@mui/material";
import NftCard from "../../components/NftCard";
import { MyContext } from "../../MyContext";

export default function CollateralNfts() {
  const {
    exchangeContractDecentralised,
    chainId,
    setLoading,
    setDialogueText,
  } = useContext(MyContext);
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
    | []
  >(null);

  const getCollateralHandler = async function (
    e: any,
    borrower: string,
    price: string
  ) {
    setLoading(true);
    try {
      const tx = await exchangeContractDecentralised.buyCollateralNft(
        borrower,
        {
          value: String(price),
        }
      );
      await tx.wait();
    } catch (e) {
      setDialogueText("NFT Purchase Failed.");
    }
    setLoading();
    setCollateralNfts(null);
    setCollateralNfts(await getCollateralNfts(chainId));
  };
  useEffect(() => {
    (async function () {
      if (chainId) setCollateralNfts(await getCollateralNfts(chainId));
      if (chainId) console.log(await getCollateralNfts(chainId));
    })();
  }, [chainId]);

  return (
    <Box>
      <Box>
        <Stack alignItems={"center"} sx={{ mt: 8 }} spacing={2}>
          {collateralNfts == null && (
            <Typography variant={"h3"}>Loading NFTs ...</Typography>
          )}
          {collateralNfts?.length == 0 && (
            <Stack alignItems={"center"} spacing={2}>
              <Typography variant={"h3"}>
                No NFts for sale currently.
              </Typography>
              <Typography variant={"h3"}>
                Please come back again later.
              </Typography>
            </Stack>
          )}
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
        </Stack>
      </Box>
    </Box>
  );
}
