import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  alpha,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { contentAPI } from "../services/api";
import { Content } from "../types";
import ContentCard from "../components/ContentCard";

export default function Dashboard() {
  const [openDialog, setOpenDialog] = useState(false);
  const [newContent, setNewContent] = useState({
    type: "NOTE",
    title: "",
    description: "",
    url: "",
    contentText: "",
    tags: "",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const response = await contentAPI.getAll({ isArchived: false });
      return response.data.data;
    },
  });

  const handleCreate = async () => {
    try {
      await contentAPI.create({
        ...newContent,
        tags: newContent.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setOpenDialog(false);
      setNewContent({
        type: "NOTE",
        title: "",
        description: "",
        url: "",
        contentText: "",
        tags: "",
      });
      refetch();
    } catch (error) {
      console.error("Failed to create content:", error);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px">
        <CircularProgress sx={{ color: "#14b8a6" }} />
      </Box>
    );
  }

  const content = data?.content || [];

  const stats = [
    { label: "Total Items", value: content.length, color: "#14b8a6" },
    {
      label: "Favorites",
      value: content.filter((i: Content) => i.isFavorite).length,
      color: "#ef4444",
    },
    {
      label: "This Week",
      value: content.filter(
        (i: Content) =>
          new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      color: "#06b6d4",
    },
  ];

  return (
    <Box>
      {/* Header Section */}
      <Box mb={4}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what you've captured recently
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Box
              sx={{
                p: 3,
                borderRadius: "16px",
                background: `${alpha(stat.color, 0.1)}`,
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: `slideIn 0.6s ease-out ${index * 0.1}s both`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 12px 24px -8px ${alpha(stat.color, 0.3)}`,
                },
                "@keyframes slideIn": {
                  from: { opacity: 0, transform: "translateY(20px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: stat.color,
                  mb: 1,
                }}>
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}>
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Content Grid */}
      {content.length > 0 && (
        <Box mb={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}>
            <Typography variant="h5" fontWeight={600}>
              Your Content
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{ display: { xs: "none", sm: "flex" } }}>
              Add Content
            </Button>
          </Box>

          <Grid container spacing={3}>
            {content.map((item: Content, index: number) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={item.id}
                sx={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
                  "@keyframes fadeInUp": {
                    from: { opacity: 0, transform: "translateY(30px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}>
                <ContentCard content={item} onUpdate={refetch} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {content.length === 0 && (
        <Box
          textAlign="center"
          py={10}
          sx={{
            animation: "fadeIn 0.8s ease-out",
            "@keyframes fadeIn": {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "30px",
              background:
                "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)",
              border: "2px dashed rgba(20, 184, 166, 0.3)",
              mb: 3,
            }}>
            <Typography variant="h2">📝</Typography>
          </Box>
          <Typography
            variant="h5"
            fontWeight={600}
            gutterBottom
            color="text.primary">
            No content yet
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            mb={4}
            maxWidth="400px"
            mx="auto">
            Start building your second brain by capturing ideas, articles, and
            thoughts
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{
              px: 4,
              py: 1.5,
            }}>
            Add Your First Item
          </Button>
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: { xs: "flex", sm: "none" },
        }}
        onClick={() => setOpenDialog(true)}>
        <Add />
      </Fab>

      {/* Create Content Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
          },
        }}>
        <DialogTitle
          sx={{
            fontSize: "1.5rem",
            fontWeight: 600,
            pb: 1,
          }}>
          Add New Content
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={newContent.type}
              onChange={(e) =>
                setNewContent({ ...newContent, type: e.target.value })
              }
              label="Type"
              native>
              <option value="NOTE">📝 Note</option>
              <option value="URL">🔗 URL</option>
              <option value="ARTICLE">📰 Article</option>
              <option value="TODO">✅ To-Do</option>
              <option value="CODE">💻 Code Snippet</option>
              <option value="PRODUCT">🛍️ Product</option>
              <option value="VIDEO">🎥 Video</option>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Title"
            value={newContent.title}
            onChange={(e) =>
              setNewContent({ ...newContent, title: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={newContent.description}
            onChange={(e) =>
              setNewContent({ ...newContent, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={2}
          />
          {(newContent.type === "URL" ||
            newContent.type === "ARTICLE" ||
            newContent.type === "VIDEO") && (
            <TextField
              fullWidth
              label="URL"
              value={newContent.url}
              onChange={(e) =>
                setNewContent({ ...newContent, url: e.target.value })
              }
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            label="Content"
            value={newContent.contentText}
            onChange={(e) =>
              setNewContent({ ...newContent, contentText: e.target.value })
            }
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={newContent.tags}
            onChange={(e) =>
              setNewContent({ ...newContent, tags: e.target.value })
            }
            margin="normal"
            helperText="e.g., work, important, ideas"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              color: "text.secondary",
              "&:hover": {
                background: "rgba(148, 163, 184, 0.1)",
              },
            }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newContent.title}
            sx={{ px: 3 }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
