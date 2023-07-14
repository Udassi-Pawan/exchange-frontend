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
      fontSize: "1rem",
      fontWeight: 900,
      fontFamily: "Roboto",
    },
  },
});

export default mytheme;
