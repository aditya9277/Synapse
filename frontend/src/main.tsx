import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#06b6d4", // Bright Cyan
      light: "#22d3ee",
      dark: "#0891b2",
    },
    secondary: {
      main: "#f59e0b", // Vibrant Amber
      light: "#fbbf24",
      dark: "#d97706",
    },
    background: {
      default: "#020617", // Almost black with blue tint
      paper: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", // Will be handled in components
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
    divider: "rgba(6, 182, 212, 0.1)",
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontWeight: 600, letterSpacing: "-0.01em" },
    h4: { fontWeight: 600, letterSpacing: "-0.005em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "linear-gradient(135deg, #020617 0%, #0a1628 25%, #020617 50%, #041c33 75%, #020617 100%)",
          backgroundSize: "200% 200%",
          backgroundAttachment: "fixed",
          animation: "gradientShift 15s ease infinite",
          position: "relative",
          "@keyframes gradientShift": {
            "0%, 100%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
          },
          "&::before": {
            content: '""',
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse at 20% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)",
            pointerEvents: "none",
            zIndex: 0,
          },
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(6, 182, 212, 0.08)",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
            borderRadius: "4px",
            "&:hover": {
              background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "12px",
          padding: "10px 24px",
          boxShadow: "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 24px -10px rgba(6, 182, 212, 0.5)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #0891b2 0%, #0ea5e9 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(10, 22, 40, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(6, 182, 212, 0.2)",
          borderRadius: "20px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            border: "1px solid rgba(6, 182, 212, 0.4)",
            boxShadow: "0 20px 40px -15px rgba(6, 182, 212, 0.4)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            transition: "all 0.3s ease",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#14b8a6",
              },
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#14b8a6",
                borderWidth: "2px",
              },
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: "16px",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 500,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "24px",
          backgroundImage: "none",
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "scale(1.1) rotate(90deg)",
            background: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
