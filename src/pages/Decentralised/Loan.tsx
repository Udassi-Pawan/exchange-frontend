import { Button, Grid, Input, Stack, Typography } from "@mui/material";
import { getNfts, getLoan } from "../../signedContracts/scriptsDecentralised";
import { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import NftCard from "../../components/NftCard";
import { MyContext } from "../../MyContext";

export default function Loan() {
  const {
    acc,
    exchangeContractDecentralised,
    nftContractDecentralised,
    chainId,
  } = useContext(MyContext);
  const theme = useTheme();
  const nftTokenId = useRef<HTMLInputElement>(null);
  const loanAmount = useRef<HTMLInputElement>(null);
  const loanPeriod = useRef<HTMLInputElement>(null);
  const [loan, setLoan] = useState<any>(null);
  const [myNfts, setMyNfts] = useState<
    | [
        {
          name: string;
          description: string;
          image: string;
          tokenId: Number;
          network: string;
        }
      ]
    | null
  >(null);
  useEffect(() => {
    (async function () {
      if (acc) {
        setLoan(await getLoan(acc, chainId));
        setMyNfts(await getNfts(acc!));
      }
    })();
  }, [acc]);

  const accessHandler = async function () {
    const tx = await nftContractDecentralised.setApprovalForAll(
      exchangeContractDecentralised.address,
      true
    );
    console.log(await tx.wait());
  };
  const getLoanHandler = async function () {
    const tx = await exchangeContractDecentralised.getLoan(
      loanAmount.current!.value,
      loanPeriod.current!.value,
      nftTokenId.current!.value
    );
    console.log(await tx.wait());
  };

  const returnHandler = async function () {
    const amount = String(loan.amount);
    console.log(amount);
    const tx = await exchangeContractDecentralised.returnLoan({
      value: amount,
    });
  };

  return (
    <Stack alignItems={"center"}>
      {!loan && (
        <Stack alignItems={"center"}>
          <Stack>
            <Grid container sx={{ m: 2 }} gap={2}>
              {myNfts?.map((i) => (
                <Grid item key={i.image}>
                  <NftCard
                    image={i.image}
                    desc={i.description}
                    name={i.name}
                    itemId={i.tokenId}
                  ></NftCard>
                </Grid>
              ))}
            </Grid>
          </Stack>

          <Stack direction={"row"} spacing={2}>
            <Input inputRef={nftTokenId} placeholder="nft itemId"></Input>
            <Input inputRef={loanAmount} placeholder="loan amount"></Input>
            <Input inputRef={loanPeriod} placeholder="loan period"></Input>
            <Button onClick={accessHandler}>Approve Access</Button>
            <Button onClick={getLoanHandler}>getLoan</Button>
          </Stack>
        </Stack>
      )}
      {loan && (
        <Stack alignItems="center" spacing={6} m={5}>
          <Stack alignItems={"center"} spacing={2}>
            <Typography>
              <b> Loan Amount :</b> {String(loan.amount)}
            </Typography>
            <Typography>
              <b>Collateral nft TokenId : </b>
              {String(loan.nftTokenId)}
            </Typography>
            <Typography>
              <b>Cutoff time : </b>
              {String(new Date(Number(loan.cutOffTimestamp) * 1000))}
            </Typography>
          </Stack>
          <Button
            sx={{
              backgroundColor: theme.palette.primary.main,
            }}
            variant="contained"
            onClick={returnHandler}
          >
            ReturnLoan
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
