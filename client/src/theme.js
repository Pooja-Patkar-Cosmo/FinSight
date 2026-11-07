import { createTheme } from "@mui/material/styles";

const theme = createTheme({

    palette: {
        mode: "dark",

        background: {
            default: "#101411",
            paper: "#1B241E"
        },

        primary: {
            main: "#39B879"
        },

        secondary: {
            main: "#91B99D"
        },

        text: {
            primary: "#F0F3EF",
            secondary: "#929C94"
        },

        divider: "#2A352D"
    },

    shape: {
        borderRadius: 10
    },

    typography: {
        fontFamily: "Inter, Arial, sans-serif",

        h4: {
            fontWeight: 700
        },

        h5: {
            fontWeight: 600
        },

        button: {
            textTransform: "none",
            fontWeight: 600
        }
    },

    components: {

        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: "#101411"
                }
            }
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 8,
                    fontWeight: 600
                }
            }
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                    border: "1px solid #2A352D",
                    borderRadius: 12
                }
            }
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none"
                }
            }
        }

    }

});

export default theme;