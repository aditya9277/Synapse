import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Person,
  Security,
  Palette,
  Download,
  Delete,
  Logout,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../services/api";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    autoSaveEnabled: true,
    darkMode: false,
    compactView: false,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSuccess("");
    setError("");
  };

  const handleProfileUpdate = () => {
    // TODO: Implement API call
    setSuccess("Profile updated successfully");
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    // TODO: Implement API call
    setSuccess("Password changed successfully");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleExportData = () => {
    // TODO: Implement data export
    setSuccess("Export initiated. You will receive an email when ready.");
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    setDeleteDialogOpen(false);
    logout();
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<Palette />} label="Preferences" />
            <Tab icon={<Download />} label="Data" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <TextField
              fullWidth
              label="Name"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) =>
                setProfileData({ ...profileData, email: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleProfileUpdate}>
              Save Changes
            </Button>
          </CardContent>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handlePasswordChange}>
              Change Password
            </Button>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Active Sessions
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Current Device"
                  secondary="Last active: Now"
                />
                <ListItemSecondaryAction>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Logout />}
                    onClick={logout}>
                    Logout
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      emailNotifications: e.target.checked,
                    })
                  }
                />
              }
              label="Email notifications"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Content
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.autoSaveEnabled}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      autoSaveEnabled: e.target.checked,
                    })
                  }
                />
              }
              label="Auto-save content"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.darkMode}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      darkMode: e.target.checked,
                    })
                  }
                />
              }
              label="Dark mode (Coming soon)"
              disabled
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.compactView}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      compactView: e.target.checked,
                    })
                  }
                />
              }
              label="Compact view"
            />

            <Box sx={{ mt: 3 }}>
              <Button variant="contained">Save Preferences</Button>
            </Box>
          </CardContent>
        </TabPanel>

        {/* Data Tab */}
        <TabPanel value={tabValue} index={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Export Your Data
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Download all your content in JSON format.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportData}>
              Request Data Export
            </Button>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom color="error">
              Danger Zone
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Once you delete your account, there is no going back. Please be
              certain.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}>
              Delete Account
            </Button>
          </CardContent>
        </TabPanel>
      </Card>

      {/* Delete Account Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be
            undone and all your data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained">
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;
