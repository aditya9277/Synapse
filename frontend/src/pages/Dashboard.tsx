import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
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
} from "@mui/material";
import {
  MoreVert,
  Add,
  Favorite,
  FavoriteBorder,
  Archive,
  Delete,
} from "@mui/icons-material";
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
        <CircularProgress />
      </Box>
    );
  }

  const content = data?.content || [];

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}>
          Add Content
        </Button>
      </Box>

      <Grid container spacing={3}>
        {content.map((item: Content) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <ContentCard content={item} onUpdate={refetch} />
          </Grid>
        ))}
      </Grid>

      {content.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No content yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Start capturing your ideas, articles, and thoughts!
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}>
            Add Your First Item
          </Button>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={() => setOpenDialog(true)}>
        <Add />
      </Fab>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Add New Content</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={newContent.type}
              onChange={(e) =>
                setNewContent({ ...newContent, type: e.target.value })
              }
              label="Type">
              <MenuItem value="NOTE">Note</MenuItem>
              <MenuItem value="URL">URL</MenuItem>
              <MenuItem value="ARTICLE">Article</MenuItem>
              <MenuItem value="TODO">To-Do</MenuItem>
              <MenuItem value="CODE">Code Snippet</MenuItem>
              <MenuItem value="PRODUCT">Product</MenuItem>
              <MenuItem value="VIDEO">Video</MenuItem>
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
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newContent.title}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
