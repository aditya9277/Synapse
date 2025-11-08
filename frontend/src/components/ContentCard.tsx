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
} from "@mui/material";
import {
  MoreVert,
  Favorite,
  FavoriteBorder,
  Archive,
  Delete,
  OpenInNew,
} from "@mui/icons-material";
import { Content } from "../types";
import { contentAPI } from "../services/api";
import { safeFormatDate } from "../utils/dateUtils";

interface ContentCardProps {
  content: Content;
  onUpdate: () => void;
}

export default function ContentCard({ content, onUpdate }: ContentCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

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
    // YouTube/Vimeo Video - Embedded Player
    if (content.type === "VIDEO" && content.url) {
      // YouTube
      if (
        content.url.includes("youtube.com") ||
        content.url.includes("youtu.be")
      ) {
        const videoId = content.url.includes("youtube.com")
          ? new URL(content.url).searchParams.get("v")
          : content.url.split("/").pop()?.split("?")[0];

        if (videoId) {
          return (
            <Box
              sx={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
              }}>
              <CardMedia
                component="iframe"
                src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
              />
            </Box>
          );
        }
      }

      // Vimeo
      if (content.url.includes("vimeo.com")) {
        const videoId = content.url.split("/").pop()?.split("?")[0];
        if (videoId) {
          return (
            <Box
              sx={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
              }}>
              <CardMedia
                component="iframe"
                src={`https://player.vimeo.com/video/${videoId}?byline=0&portrait=0`}
                title={content.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
              />
            </Box>
          );
        }
      }

      // Fallback video thumbnail
      return (
        <CardMedia
          component="img"
          height="240"
          image={
            content.thumbnailUrl ||
            "https://via.placeholder.com/400x225?text=Video"
          }
          alt={content.title}
        />
      );
    }

    // Product - Show as Product Card
    if (content.type === "PRODUCT" && content.metadata) {
      return (
        <Box sx={{ position: "relative", backgroundColor: "#f8fafc" }}>
          <CardMedia
            component="img"
            height="240"
            image={
              content.thumbnailUrl ||
              content.metadata.image ||
              "https://via.placeholder.com/400x300?text=Product"
            }
            alt={content.title}
            sx={{
              objectFit: "contain",
              padding: 2,
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
          {content.metadata.price && (
            <Chip
              label={content.metadata.price}
              sx={{
                position: "absolute",
                bottom: 12,
                right: 12,
                backgroundColor: "#10b981",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                height: 32,
              }}
            />
          )}
        </Box>
      );
    }

    // Article/Book - Show as Book Cover
    if (
      (content.type === "ARTICLE" || content.type === "BOOKMARK") &&
      content.metadata
    ) {
      const hasBookInfo = content.metadata.author || content.metadata.publisher;

      if (hasBookInfo) {
        return (
          <Box
            sx={{
              height: 280,
              background: `linear-gradient(135deg, ${
                typeColors[content.type] || "#0ea5e9"
              }40 0%, ${typeColors[content.type] || "#0ea5e9"}10 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 3,
              position: "relative",
              overflow: "hidden",
            }}>
            <Box
              sx={{
                width: "80%",
                height: "90%",
                backgroundColor: "white",
                borderRadius: 1,
                boxShadow: isHovered
                  ? "0 20px 40px rgba(0,0,0,0.3)"
                  : "0 10px 25px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                transform: isHovered
                  ? "translateY(-10px) rotateY(5deg)"
                  : "translateY(0) rotateY(0deg)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 3,
                border: "1px solid #e2e8f0",
              }}>
              {content.thumbnailUrl ? (
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <>
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ fontWeight: 700, mb: 2 }}>
                    📖
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{ fontWeight: 600 }}>
                    {content.metadata.author || "Book"}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        );
      }
    }

    // TODO - Show as List Item
    if (content.type === "TODO") {
      return (
        <Box
          sx={{
            backgroundColor: "#fffbeb",
            padding: 3,
            minHeight: 160,
            display: "flex",
            alignItems: "center",
          }}>
          <Box sx={{ width: "100%" }}>
            <Typography variant="h3" sx={{ mb: 2, opacity: 0.3 }}>
              ✓
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, color: "#78350f" }}>
              {content.description || content.title}
            </Typography>
          </Box>
        </Box>
      );
    }

    // Screenshot/Image - Show Full Image
    if (
      (content.type === "SCREENSHOT" || content.type === "IMAGE") &&
      content.thumbnailUrl
    ) {
      return (
        <CardMedia
          component="img"
          height="240"
          image={content.thumbnailUrl}
          alt={content.title}
          sx={{
            objectFit: "cover",
            transition: "transform 0.3s ease",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
      );
    }

    // Default - Show thumbnail or placeholder
    const image = getCardImage();
    if (image) {
      return (
        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <CardMedia
            component="img"
            height="200"
            image={image}
            alt={content.title}
            sx={{
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isHovered ? "scale(1.1)" : "scale(1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: isHovered
                ? "linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.8) 100%)"
                : "transparent",
              transition: "all 0.3s ease",
            }}
          />
        </Box>
      );
    }

    return null;
  };

  const typeColors: Record<string, string> = {
    NOTE: "#14b8a6",
    URL: "#06b6d4",
    ARTICLE: "#0ea5e9",
    TODO: "#f59e0b",
    CODE: "#10b981",
    PRODUCT: "#ec4899",
    VIDEO: "#ef4444",
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "inherit",
          padding: "1px",
          background: isHovered
            ? `linear-gradient(135deg, ${
                typeColors[content.type] || "#14b8a6"
              } 0%, #06b6d4 100%)`
            : "transparent",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          transition: "all 0.3s ease",
          pointerEvents: "none",
        },
      }}>
      {renderContentPreview()}

      <CardContent sx={{ flexGrow: 1, position: "relative" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="start"
          mb={2}>
          <Chip
            label={content.type}
            size="small"
            sx={{
              background: `${typeColors[content.type] || "#14b8a6"}20`,
              color: typeColors[content.type] || "#14b8a6",
              border: `1px solid ${typeColors[content.type] || "#14b8a6"}40`,
              fontWeight: 600,
              fontSize: "0.7rem",
              height: "24px",
            }}
          />
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              opacity: isHovered ? 1 : 0.7,
              transition: "opacity 0.3s ease",
            }}>
            <IconButton
              size="small"
              onClick={handleToggleFavorite}
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.2)",
                  background: "rgba(239, 68, 68, 0.1)",
                },
              }}>
              {content.isFavorite ? (
                <Favorite sx={{ color: "#ef4444", fontSize: 20 }} />
              ) : (
                <FavoriteBorder sx={{ fontSize: 20 }} />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.2)",
                  background: "rgba(20, 184, 166, 0.1)",
                },
              }}>
              <MoreVert sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        <Typography
          variant="h6"
          component="div"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: "1.1rem",
            lineHeight: 1.3,
            mb: 1.5,
          }}>
          {content.title}
        </Typography>

        {/* Product - Show Price and Rating */}
        {content.type === "PRODUCT" && content.metadata && (
          <Box sx={{ mb: 2 }}>
            {content.metadata.price && (
              <Typography
                variant="h6"
                sx={{ color: "#10b981", fontWeight: 700, mb: 0.5 }}>
                {content.metadata.price}
              </Typography>
            )}
            {content.metadata.rating && (
              <Typography variant="body2" color="text.secondary">
                ⭐ {content.metadata.rating}{" "}
                {content.metadata.reviews
                  ? `(${content.metadata.reviews} reviews)`
                  : ""}
              </Typography>
            )}
          </Box>
        )}

        {/* Article/Book - Show Author and Publisher */}
        {(content.type === "ARTICLE" || content.type === "BOOKMARK") &&
          content.metadata && (
            <Box sx={{ mb: 2 }}>
              {content.metadata.author && (
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                  By {content.metadata.author}
                </Typography>
              )}
              {content.metadata.publisher && (
                <Typography variant="caption" color="text.secondary">
                  {content.metadata.publisher}
                </Typography>
              )}
            </Box>
          )}

        {content.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
            sx={{
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
            {content.description.length > 120
              ? content.description.substring(0, 120) + "..."
              : content.description}
          </Typography>
        )}

        {content.contentText && !content.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
            sx={{
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
            {content.contentText.length > 120
              ? content.contentText.substring(0, 120) + "..."
              : content.contentText}
          </Typography>
        )}

        <Box
          mt={2}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.75,
          }}>
          {content.tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                background: "rgba(148, 163, 184, 0.1)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                fontSize: "0.75rem",
                height: "24px",
                animation: `fadeInTag 0.3s ease-out ${index * 0.1}s both`,
                "@keyframes fadeInTag": {
                  from: { opacity: 0, transform: "scale(0.8)" },
                  to: { opacity: 1, transform: "scale(1)" },
                },
              }}
            />
          ))}
          {content.tags.length > 3 && (
            <Chip
              label={`+${content.tags.length - 3}`}
              size="small"
              sx={{
                background: "rgba(20, 184, 166, 0.1)",
                border: "1px solid rgba(20, 184, 166, 0.3)",
                fontSize: "0.75rem",
                height: "24px",
              }}
            />
          )}
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
          pt={2}
          borderTop="1px solid rgba(148, 163, 184, 0.1)">
          <Typography
            variant="caption"
            color="text.secondary"
            fontSize="0.75rem">
            {safeFormatDate(content.createdAt)}
          </Typography>
          {content.url && (
            <IconButton
              size="small"
              onClick={() => window.open(content.url, "_blank")}
              sx={{
                color: "#14b8a6",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateX(4px)",
                  background: "rgba(20, 184, 166, 0.1)",
                },
              }}>
              <OpenInNew fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            minWidth: 160,
          },
        }}>
        <MenuItem
          onClick={handleArchive}
          sx={{
            gap: 1,
            "&:hover": {
              background: "rgba(20, 184, 166, 0.1)",
            },
          }}>
          <Archive fontSize="small" />
          Archive
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{
            gap: 1,
            color: "error.main",
            "&:hover": {
              background: "rgba(239, 68, 68, 0.1)",
            },
          }}>
          <Delete fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
