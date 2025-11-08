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
  Grid,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register");
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
        py: 4,
        "&::before": {
          content: '""',
          position: "absolute",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)",
          top: "-300px",
          left: "-300px",
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
          right: "-250px",
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
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join Synapse and build your second brain
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
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlined sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlined sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Min 8 characters, include uppercase, lowercase, and number"
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
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#14b8a6",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
