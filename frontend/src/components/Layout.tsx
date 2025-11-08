import { Outlet } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Collections as CollectionsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Logout,
  Notifications,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 280;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Search", icon: <SearchIcon />, path: "/search" },
    { text: "Collections", icon: <CollectionsIcon />, path: "/collections" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const drawer = (
    <Box
      sx={{
        height: "100%",
        background: "linear-gradient(180deg, #0a1628 0%, #020617 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "200px",
          background:
            "radial-gradient(ellipse at top, rgba(6, 182, 212, 0.15) 0%, transparent 60%)",
          pointerEvents: "none",
        },
        display: "flex",
        flexDirection: "column",
      }}>
      <Box sx={{ p: 3, pb: 2, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
              boxShadow:
                "0 8px 16px -4px rgba(6, 182, 212, 0.6), 0 0 24px rgba(6, 182, 212, 0.2)",
            }}>
            <Typography
              variant="h5"
              sx={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
              ⚡
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Synapse
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your Second Brain
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ flex: 1, px: 2, position: "relative", zIndex: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: "12px",
                py: 1.5,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&.Mui-selected": {
                  background:
                    "linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(8, 145, 178, 0.2) 100%)",
                  border: "1px solid rgba(6, 182, 212, 0.4)",
                  boxShadow: "0 4px 12px rgba(6, 182, 212, 0.2)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(8, 145, 178, 0.25) 100%)",
                  },
                },
                "&:hover": {
                  background: "rgba(6, 182, 212, 0.08)",
                  transform: "translateX(4px)",
                },
                animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                "@keyframes slideIn": {
                  from: { opacity: 0, transform: "translateX(-20px)" },
                  to: { opacity: 1, transform: "translateX(0)" },
                },
              }}>
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? "#06b6d4"
                      : "text.secondary",
                  minWidth: 40,
                  transition: "all 0.3s",
                }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(6, 182, 212, 0.15)",
          position: "relative",
          zIndex: 1,
        }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderRadius: "12px",
            background: "rgba(6, 182, 212, 0.08)",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              background: "rgba(6, 182, 212, 0.15)",
              transform: "scale(1.02)",
            },
          }}
          onClick={handleMenu}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
            }}>
            {user?.firstName?.[0] || user?.email?.[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.firstName || user?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: "transparent",
          backdropFilter: "none",
          boxShadow: "none",
        }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
              "&:hover": {
                background: "rgba(6, 182, 212, 0.15)",
              },
            }}>
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find((item) => item.path === location.pathname)?.text ||
              "Synapse"}
          </Typography>
          <IconButton
            color="inherit"
            sx={{
              mr: 1,
              "&:hover": {
                background: "rgba(6, 182, 212, 0.15)",
              },
            }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
            },
          }}>
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
            },
          }}
          open>
          {drawer}
        </Drawer>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: -1,
            borderRadius: "12px",
            minWidth: 200,
          },
        }}>
        <MenuItem
          onClick={() => {
            navigate("/settings");
            handleClose();
          }}
          sx={{
            gap: 1,
            "&:hover": {
              background: "rgba(20, 184, 166, 0.1)",
            },
          }}>
          <SettingsIcon sx={{ fontSize: 20 }} /> Settings
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          sx={{
            gap: 1,
            color: "error.main",
            "&:hover": {
              background: "rgba(239, 68, 68, 0.1)",
            },
          }}>
          <Logout sx={{ fontSize: 20 }} /> Logout
        </MenuItem>
      </Menu>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          background: "#0f172a",
        }}>
        <Toolbar />
        <Box
          sx={{
            animation: "fadeIn 0.6s ease-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(20px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
