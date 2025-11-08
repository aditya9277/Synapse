import { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  CardActions,
} from "@mui/material";
import {
  MoreVert,
  Favorite,
  FavoriteBorder,
  Archive,
  Delete,
  OpenInNew,
  PlayArrow,
} from "@mui/icons-material";
import { Content } from "../types";
import { contentAPI } from "../services/api";
import { format } from "date-fns";

interface ContentCardProps {
  content: Content;
  onUpdate: () => void;
}

export default function ContentCard({ content, onUpdate }: ContentCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleFavorite = async () => {
    try {
      await contentAPI.update(content.id, { isFavorite: !content.isFavorite });
      onUpdate();
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  const handleArchive = async () => {
    try {
      await contentAPI.update(content.id, { isArchived: true });
      handleMenuClose();
      onUpdate();
    } catch (error) {
      console.error("Failed to archive:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await contentAPI.delete(content.id);
        handleMenuClose();
        onUpdate();
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  const getCardImage = () => {
    if (content.thumbnailUrl) return content.thumbnailUrl;
    if (content.type === "VIDEO")
      return "https://via.placeholder.com/400x200?text=Video";
    if (content.type === "PRODUCT")
      return "https://via.placeholder.com/400x200?text=Product";
    if (content.type === "ARTICLE")
      return "https://via.placeholder.com/400x200?text=Article";
    return null;
  };

  const renderContentPreview = () => {
    if (content.type === "VIDEO" && content.url) {
      const videoId = content.url.includes("youtube.com")
        ? new URL(content.url).searchParams.get("v")
        : null;

      if (videoId) {
        return (
          <CardMedia
            component="iframe"
            height="200"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={content.title}
          />
        );
      }
    }

    const image = getCardImage();
    if (image) {
      return (
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={content.title}
        />
      );
    }

    return null;
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {renderContentPreview()}

      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="start"
          mb={1}>
          <Chip
            label={content.type}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Box>
            <IconButton size="small" onClick={handleToggleFavorite}>
              {content.isFavorite ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="h6" component="div" gutterBottom>
          {content.title}
        </Typography>

        {content.description && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {content.description.length > 100
              ? content.description.substring(0, 100) + "..."
              : content.description}
          </Typography>
        )}

        {content.contentText && !content.description && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {content.contentText.length > 100
              ? content.contentText.substring(0, 100) + "..."
              : content.contentText}
          </Typography>
        )}

        <Box mt={2}>
          {content.tags.slice(0, 3).map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
          {content.tags.length > 3 && (
            <Chip label={`+${content.tags.length - 3}`} size="small" />
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1}>
          {format(new Date(content.createdAt), "MMM d, yyyy")}
        </Typography>
      </CardContent>

      {content.url && (
        <CardActions>
          <IconButton
            size="small"
            onClick={() => window.open(content.url, "_blank")}>
            <OpenInNew fontSize="small" />
          </IconButton>
        </CardActions>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}>
        <MenuItem onClick={handleArchive}>
          <Archive sx={{ mr: 1 }} fontSize="small" />
          Archive
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
