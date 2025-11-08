import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Fab,
  Menu,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  Add,
  Folder,
  MoreVert,
  Delete,
  Edit,
  Share,
  Public,
  Lock,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionsAPI } from "../services/api";
import type { Collection } from "../types";

const Collections: React.FC = () => {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  const {
    data: collections = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionsAPI.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: collectionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setCreateDialogOpen(false);
      setNewCollection({ name: "", description: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      collectionsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setEditingCollection(null);
      handleMenuClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: collectionsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      handleMenuClose();
    },
  });

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    collection: Collection
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCollection(collection);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCollection(null);
  };

  const handleCreate = () => {
    if (newCollection.name.trim()) {
      createMutation.mutate(newCollection);
    }
  };

  const handleEdit = () => {
    if (selectedCollection) {
      setEditingCollection(selectedCollection);
      handleMenuClose();
    }
  };

  const handleUpdate = () => {
    if (editingCollection && editingCollection.name.trim()) {
      updateMutation.mutate({
        id: editingCollection.id,
        data: {
          name: editingCollection.name,
          description: editingCollection.description,
        },
      });
    }
  };

  const handleDelete = () => {
    if (selectedCollection) {
      if (
        confirm(`Are you sure you want to delete "${selectedCollection.name}"?`)
      ) {
        deleteMutation.mutate(selectedCollection.id);
      }
    }
  };

  const handleTogglePublic = () => {
    if (selectedCollection) {
      updateMutation.mutate({
        id: selectedCollection.id,
        data: { isPublic: !selectedCollection.isPublic },
      });
    }
  };

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load collections</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}>
        <Typography variant="h4">Collections</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}>
          New Collection
        </Button>
      </Box>

      {collections.length === 0 && !isLoading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Folder sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No collections yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Create collections to organize your content
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}>
            Create Your First Collection
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {collections.map((collection) => (
          <Grid item xs={12} sm={6} md={4} key={collection.id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Folder color="primary" />
                    <Typography variant="h6">{collection.name}</Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, collection)}>
                    <MoreVert />
                  </IconButton>
                </Box>
                {collection.description && (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {collection.description}
                  </Typography>
                )}
                <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={`${collection._count?.items || 0} items`}
                    size="small"
                  />
                  <Chip
                    icon={collection.isPublic ? <Public /> : <Lock />}
                    label={collection.isPublic ? "Public" : "Private"}
                    size="small"
                    color={collection.isPublic ? "success" : "default"}
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" href={`/collections/${collection.id}`}>
                  View Items
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleTogglePublic}>
          {selectedCollection?.isPublic ? (
            <>
              <Lock sx={{ mr: 1 }} fontSize="small" />
              Make Private
            </>
          ) : (
            <>
              <Public sx={{ mr: 1 }} fontSize="small" />
              Make Public
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Create Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newCollection.name}
            onChange={(e) =>
              setNewCollection({ ...newCollection, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            value={newCollection.description}
            onChange={(e) =>
              setNewCollection({
                ...newCollection,
                description: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newCollection.name.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCollection}
        onClose={() => setEditingCollection(null)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Edit Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={editingCollection?.name || ""}
            onChange={(e) =>
              setEditingCollection(
                editingCollection
                  ? { ...editingCollection, name: e.target.value }
                  : null
              )
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            multiline
            rows={3}
            value={editingCollection?.description || ""}
            onChange={(e) =>
              setEditingCollection(
                editingCollection
                  ? { ...editingCollection, description: e.target.value }
                  : null
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCollection(null)}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={!editingCollection?.name.trim()}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Collections;
