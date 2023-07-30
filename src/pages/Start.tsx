import { CssBaseline, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import MyDialogue from "../components/MyDialogue";

export default function Start() {
  return (
    <>
      <MyDialogue />

      <CssBaseline></CssBaseline>
      <Stack justifyContent={"center"} alignItems={"center"}>
        <Link to="/decentralised/create">dec</Link>
        <Link to="/centralised/create">cen</Link>
      </Stack>
    </>
  );
}
