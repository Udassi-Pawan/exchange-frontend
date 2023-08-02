import { Box, CssBaseline, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import "./Start.css";

export default function Start() {
  return (
    <Box
      sx={{
        // backgroundImage:
        //   "url('https://cdn.pixabay.com/photo/2015/01/31/05/05/background-618226_1280.png')",
        backgroundImage:
          "url('https://cdn.pixabay.com/photo/2017/01/18/18/03/filter-1990470_1280.jpg')",
        backgroundSize: 1800,
        backgroundRepeat: "no-repeat",
        pt: 20,
        height: "100vh",
      }}
    >
      <Stack alignItems={"center"}>
        {/* <CssBaseline></CssBaseline> */}
        <Stack alignItems={"center"} direction={"row"}>
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
