import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import "./NftCardCentralised.css";
import { nameFromId } from "../signedContracts/signedC";
export default function NftCardCentralised(props: any) {
  const theme = useTheme();

  return (
    <Box className="book">
      <Stack alignItems={"center"} width={"80%"}>
        <Typography className="heading">{props.name}</Typography>
        {props.itemId != null && (
          <Typography className="itemId">itemId: {props.itemId}</Typography>
        )}

        <Typography className="itemId">
          network: {nameFromId.get(props.network)}
        </Typography>

        {props.price != null && (
          <Typography className="itemId">price: {props.price}</Typography>
        )}
        <Typography
          ml={"17%"}
          sx={{ textAlign: "justify" }}
          fontSize={"0.6rem"}
          className="desc"
        >
          {props.desc}
        </Typography>
      </Stack>
      <Box className="cover">
        <img src={props.image}></img>
      </Box>
    </Box>
  );
}
