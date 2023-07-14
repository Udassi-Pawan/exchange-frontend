import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { Grid, SvgIcon } from "@mui/material";
const pages = [
  ["CREATE", "create"],
  ["LOAN", "loan"],
  ["STAKE", "stake"],
  ["EXCHANGE", "exchange"],
  ["VALIDATOR", "validator"],
];

function Navbar() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: 2,
      }}
    >
      <Grid
        container
        direction="row"
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Grid item>
          <Grid container direction="row" alignItems={"center"}>
            <Grid item>
              <Grid container direction="row" alignItems="center">
                <Grid>
                  <CurrencyExchangeIcon
                    color="primary"
                    sx={{
                      fontSize: 80,
                    }}
                  ></CurrencyExchangeIcon>
                </Grid>
                <Grid item direction="column">
                  <Grid item>
                    <Typography
                      fontSize={20}
                      variant="h1"
                      color={theme.palette.primary.main}
                    >
                      DECENTRALISED
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      fontSize={25}
                      variant="h1"
                      color={theme.palette.primary.main}
                    >
                      EXCHANGE
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container direction={"row"} spacing={4}>
                {pages.map((page) => (
                  <Grid item>
                    <Link
                      key={page[0]}
                      style={{
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                        textTransform: "none",
                        fontWeight: "bold",
                      }}
                      to={page[1]}
                    >
                      <Typography variant="body2" fontFamily={"Roboto"}>
                        {page[0]}
                      </Typography>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>efgh</Grid>
      </Grid>
    </Box>
  );
}
export default Navbar;
