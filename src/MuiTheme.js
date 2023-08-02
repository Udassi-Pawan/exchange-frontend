import { createTheme } from "@mui/material/styles";

const mytheme = createTheme({
  palette: {
    primary: {
      main: "#05386B",
    },
    secondary: {
      main: "#8EE4AF",
      dark: "#379683",
      light: "#EDF5E1",
    },
    background: {
      default: "#5CDB95",
    },
  },
  // overrides: {
  //   MuiCssBaseline: {
  //     "@global": {
  //       body: {
  //         backgroundColor: "#1f262a",
  //       },
  //     },
  //   },
  // },

  typography: {
    fontFamily: ["Roboto", "Lato", "Sans Serif", "Tektur"],
    fontWeightRegular: 400,
    fontWeightBold: 700,
    h1: {
      fontFamily: "Tektur",
      fontSize: "3rem",
      fontWeight: 800,
      lineHeight: 1.167,
      lettingSpacing: "-0.01562em",
    },
    body2: {
      fontSize: "0.8rem",
      fontWeight: 800,
      fontFamily: "Roboto",
      letterSpacing: 2,
    },
  },
});

export default mytheme;
