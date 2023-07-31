import { CssBaseline, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import MyDialogue from "../components/MyDialogue";

export default function Start() {
  return (
    <>
      <MyDialogue />

      <CssBaseline></CssBaseline>
      <Stack justifyContent={"center"} alignItems={"center"}>
        <Link to="/decentralised/nft">dec</Link>
        <Link to="/centralised/nft">cen</Link>
      </Stack>
    </>
  );
}
