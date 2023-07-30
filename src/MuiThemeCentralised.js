import { createTheme } from "@mui/material/styles";

const centerTheme = createTheme({
  palette: {
    primary: {
      main: "#DFDCE3",
    },
    secondary: {
      main: "#FC4A1A",
      dark: "#F7B733",
      light: "#AAA",
    },
    background: {
      default: "#4ABDAC",
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
      fontSize: "0.8rem",
      fontWeight: 800,
      fontFamily: "Roboto",
      letterSpacing: 2,
    },
  },
});

export default centerTheme;
