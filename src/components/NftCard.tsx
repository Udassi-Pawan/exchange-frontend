import { Box, Typography } from "@mui/material";
import "./NftCard.css";

export default function NftCard(props: {
  image: string;
  name: String;
  itemId?: Number;
  desc: String;
  price?: String;
}) {
  return (
    <Box className="card-container">
      <Box className="cardnft">
        <Box className="img-content">
          <img src={props.image}></img>
        </Box>
        <Box className="content">
          <Typography color="#333" className="heading">
            {props.name}
          </Typography>
          {props.itemId != null ? (
            <Typography color="#333" className="itemId">
              itemId: {String(props.itemId)}
            </Typography>
          ) : (
            ""
          )}
          {props.price != null && (
            <Typography color="#333" className="itemId">
              price: {props.price}
            </Typography>
          )}
          <Typography color="#333" className="desc">
            {props.desc}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
