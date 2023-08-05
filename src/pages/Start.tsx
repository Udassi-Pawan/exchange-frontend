import { Box, Button, CssBaseline, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import "./Start.css";
import { ethers } from "ethers";
import { useContext } from "react";
import { MyContext } from "../MyContext";

export default function Start() {
  const { setDialogueText } = useContext(MyContext);
  const metamaskHandler = async function () {
    console.log(window.ethereum);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      if ((await provider!.listAccounts())[0])
        return setDialogueText("Metamask already connected.");
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        await provider.send("eth_requestAccounts", []);
      } catch (e) {
        setDialogueText("Please unlock Metamask from extension menu.");
      }
    } catch (e) {
      setDialogueText("Please install metamask");
    }
  };
  return (
    <Box
      sx={{
        backgroundImage:
          "url('https://cdn.pixabay.com/photo/2017/01/18/18/03/filter-1990470_1280.jpg')",
        backgroundSize: 6000,
        pt: 20,
        height: "200vh",
      }}
    >
      <Stack alignItems={"center"}>
        <Button
          variant={"contained"}
          sx={{ backgroundColor: "#bbb", mb: 2, mr: 1, color: "green" }}
          onClick={metamaskHandler}
        >
          Connect Metamask
        </Button>
        <Stack alignItems={"center"} direction={{ md: "row", xs: "column" }}>
          <div className="card">
            <div className="header">
              <span className="title">Exchange</span>
              <span className="price">Centralised</span>
            </div>
            <p className="desc">Get all the features and maximum utility</p>
            <ul className="lists">
              <li className="list">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span>
                  Deposit crypto in one network, withdraw in another.{" "}
                </span>
              </li>
              <li className="list">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span>Complete KYC to get Loan</span>
              </li>
              <li className="list">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span>Supports Mumbai, Sepolia and BSC Testnets</span>
              </li>
            </ul>
            <Link to="centralised/nft">
              <button type="button" className="action">
                Go Featured
              </button>
            </Link>
          </div>{" "}
          <div className="carddec card">
            <div className="header">
              <span className="title">Exchange</span>
              <span className="price">Decentralised</span>
            </div>
            <p className="desc">Security maximized with POS consensus</p>
            <ul className="lists">
              <li className="list">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span>
                  {" "}
                  Get dedicated tokens for deposit in each network crypto{" "}
                </span>
              </li>
              <li className="list">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span>No KYC needed to get Loan </span>
              </li>
              <li className="list">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span>Supports Polygon and Mumbai Testnets</span>
              </li>
            </ul>
            <Link to="decentralised/nft">
              <button type="button" className="action">
                Go Secured
              </button>
            </Link>
          </div>
        </Stack>
      </Stack>
    </Box>
  );
}
