import { CssBaseline, Stack } from "@mui/material";
import { Link } from "react-router-dom";

export default function Start() {
  return (
    <>
      <CssBaseline></CssBaseline>
      <Stack justifyContent={"center"} alignItems={"center"}>
        <Link to="/decentralised/create">dec</Link>
        <Link to="/centralised/create">cen</Link>
      </Stack>
    </>
  );
}
