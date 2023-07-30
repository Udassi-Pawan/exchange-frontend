import { useContext, useEffect, useState } from "react";
import { getCollateralNfts } from "../../signedContracts/scriptsDecentralised";
import { Stack, Box, Button, Grid } from "@mui/material";
import NftCard from "../../components/NftCard";
import { MyContext } from "../../MyContext";

export default function CollateralNfts() {
  const { exchangeContractDecentralised, chainId } = useContext(MyContext);
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
    const tx = await exchangeContractDecentralised.buyCollateralNft(borrower, {
      value: String(price),
    });
  };
  useEffect(() => {
    (async function () {
      setCollateralNfts(await getCollateralNfts(chainId));
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
