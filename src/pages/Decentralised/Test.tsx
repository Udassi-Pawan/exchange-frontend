import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import { Grid } from "@mui/material";
const pages = [
  ["CREATE", "create"],
  ["LOAN", "loan"],
  ["STAKE", "stake"],
  ["EXCHANGE", "exchange"],
  ["VALIDATOR", "validator"],
];

export default function Test() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: 2,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Grid container direction="row" justifyItems={"space-between"}>
        <Grid item>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <CurrencyExchangeIcon
              color="primary"
              sx={{
                fontSize: 80,
              }}
            ></CurrencyExchangeIcon>
            <Grid
              sx={{ mt: 2 }}
              container
              direction={"column"}
              alignItems={"center"}
            >
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
          </Box>
        </Grid>
        <Grid item>
          <Box
            sx={{
              display: "flex",
              gap: 6,
            }}
          >
            {pages.map((page) => (
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
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
