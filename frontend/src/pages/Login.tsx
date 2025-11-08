import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #020617 0%, #0a1628 25%, #020617 50%, #041c33 75%, #020617 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 15s ease infinite",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)",
          top: "-300px",
          right: "-300px",
          animation: "pulse 6s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
          bottom: "-250px",
          left: "-250px",
          animation: "pulse 6s ease-in-out infinite 3s",
        },
        "@keyframes gradientShift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "@keyframes pulse": {
          "0%, 100%": { opacity: 0.5, transform: "scale(1)" },
          "50%": { opacity: 0.8, transform: "scale(1.1)" },
        },
      }}>
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            background: "rgba(10, 22, 40, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
            borderRadius: "24px",
            position: "relative",
            zIndex: 1,
            boxShadow: "0 20px 60px rgba(6, 182, 212, 0.15)",
            animation: "slideUp 0.6s ease-out",
            "@keyframes slideUp": {
              from: { opacity: 0, transform: "translateY(30px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}>
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                mb: 3,
                boxShadow:
                  "0 10px 40px -5px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)",
                animation: "float 3s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0px)" },
                  "50%": { transform: "translateY(-10px)" },
                },
              }}>
              <Typography
                variant="h3"
                sx={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
                ⚡
              </Typography>
            </Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
              }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to access your second brain
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: "12px",
                animation: "shake 0.5s",
                "@keyframes shake": {
                  "0%, 100%": { transform: "translateX(0)" },
                  "25%": { transform: "translateX(-10px)" },
                  "75%": { transform: "translateX(10px)" },
                },
              }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                mb: 2,
              }}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#14b8a6",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}>
                Create Account
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
