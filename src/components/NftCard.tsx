import { Box, Typography } from "@mui/material";
import "./NftCard.css";

export default function NftCard(props: any) {
  return (
    <Box className="card-container">
      <Box className="cardnft">
        <Box className="img-content">
          <img src={props.image}></img>
        </Box>
        <Box className="content">
          <Typography className="heading">{props.name}</Typography>
          {props.itemId != null ? (
            <Typography className="itemId">itemId: {props.itemId}</Typography>
          ) : (
            ""
          )}
          {props.price != null && (
            <Typography className="itemId">price: {props.price}</Typography>
          )}
          <Typography className="desc">{props.desc}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
