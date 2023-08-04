import { Button, Grid, Input, Stack, Typography } from "@mui/material";
import {
  getNfts,
  getLoan,
  getBalance,
} from "../../signedContracts/scriptsDecentralised";
import { useContext, useEffect, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import NftCard from "../../components/NftCard";
import { MyContext } from "../../MyContext";
import { Link } from "react-router-dom";
export default function Loan() {
  const {
    acc,
    exchangeContractDecentralised,
    nftContractDecentralised,
    chainId,
    setLoading,
    setDialogueText,
  } = useContext(MyContext);
  const theme = useTheme();
  const [sepoliaBalance, setSepoliaBalance] = useState<string | null>(null);
  const [mumbaiBalance, setMumbaiBalance] = useState<string | null>(null);

  const nftTokenId = useRef<HTMLInputElement>(null);
  const loanAmount = useRef<HTMLInputElement>(null);
  const loanPeriod = useRef<HTMLInputElement>(null);
  const [loan, setLoan] = useState<any>("");
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
    | []
  >(null);
  useEffect(() => {
    (async function () {
      if (acc && chainId) {
        setLoan(await getLoan(acc, chainId));
        setMyNfts(await getNfts(acc!, chainId));
      }
    })();
  }, [acc, chainId]);
  useEffect(() => {
    (async function () {
      setSepoliaBalance(await getBalance("11155111"));
      setMumbaiBalance(await getBalance("80001"));
    })();
  }, []);

  const accessHandler = async function () {
    setLoading(true);

    try {
      const tx = await nftContractDecentralised.setApprovalForAll(
        exchangeContractDecentralised.address,
        true
      );
      console.log(await tx.wait());
    } catch (e) {
      setDialogueText("Approval Transaction Failed.");
    }
    setLoading();
  };
  const getLoanHandler = async function () {
    try {
      if (
        !loanAmount.current!.value ||
        !loanPeriod.current!.value ||
        !nftTokenId.current
      )
        throw new Error();
      if (Number(loanAmount.current!.value) > 1001)
        return setDialogueText("Loan amount should be less than 1000wei.");
      if (Number(loanPeriod.current!.value) > 3600)
        return setDialogueText("Loan Period should be less than 3600s.");
      if (Number(loanAmount.current!.value) > Number(await getBalance(chainId)))
        return setDialogueText(
          "Not enough funds for loan available. Please try again later."
        );
      setLoading(true);
      const tx = await exchangeContractDecentralised.getLoan(
        loanAmount.current!.value,
        loanPeriod.current!.value,
        nftTokenId.current!.value
      );
      console.log(await tx.wait());
    } catch (e) {
      setDialogueText("Loan Credit Transaction Failed.");
    }
    setLoading();
    setLoan("");
    setLoan(await getLoan(acc, chainId));
  };

  const returnHandler = async function () {
    setLoading(true);
    try {
      const amount = String(loan.amount);
      console.log(amount);
      const tx = await exchangeContractDecentralised.returnLoan({
        value: amount,
      });
      await tx.wait();
    } catch (e) {
      setDialogueText("Loan Return Transaction Failed.");
    }
    setLoading();
  };

  return (
    <Stack alignItems={"center"}>
      <Stack spacing={2} sx={{ mt: 3 }}>
        <Typography sx={{ textDecoration: "underline" }}>
          Contract Sepolia Balance : {sepoliaBalance}
        </Typography>
        <Typography sx={{ textDecoration: "underline" }}>
          Contract Mumbai Balance : {mumbaiBalance}
        </Typography>
      </Stack>
      {!loan && (
        <Stack alignItems={"center"} spacing={5}>
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
              {myNfts == null && (
                <Typography variant={"h5"}>Loading ...</Typography>
              )}
              {myNfts?.length == 0 && (
                <Typography textAlign={"center"} variant={"h5"} sx={{ mt: 8 }}>
                  <Link to="/decentralised/nft">Get</Link> an NFT to stake as
                  collateral for Loan.
                </Typography>
              )}
            </Grid>
          </Stack>
          {myNfts != null && myNfts?.length != 0 && loan == "" && (
            <Typography variant="h3">Loading Loan ...</Typography>
          )}
          {myNfts != null && myNfts?.length != 0 && loan == null && (
            <Typography variant="h3">Get Loan Now.</Typography>
          )}
          {myNfts != null && myNfts?.length != 0 && (
            <Stack direction={"row"} spacing={2}>
              <Input inputRef={nftTokenId} placeholder="nft itemId"></Input>
              <Input inputRef={loanAmount} placeholder="loan amount"></Input>
              <Input inputRef={loanPeriod} placeholder="loan period"></Input>
              <Button onClick={accessHandler}>Approve Access</Button>
              <Button onClick={getLoanHandler}>getLoan</Button>
            </Stack>
          )}
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
            Return Loan
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
