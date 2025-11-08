import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  TextField,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  InputAdornment,
  Chip,
  alpha,
} from "@mui/material";
import { Search as SearchIcon, TrendingUp } from "@mui/icons-material";
import { searchAPI } from "../services/api";
import ContentCard from "../components/ContentCard";
import { Content } from "../types";

export default function Search() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      const response = await searchAPI.search(debouncedQuery);
      return response.data.data;
    },
    enabled: !!debouncedQuery,
  });

  // Debounce search
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  });

  const handleSearch = (value: string) => {
    setQuery(value);
    setTimeout(() => setDebouncedQuery(value), 500);
  };

  const exampleSearches = [
    "articles about React I saved last week",
    "todo list from yesterday",
    "inspiration for logo design",
    "black leather shoes under $300",
  ];

  return (
    <Box>
      {/* Header */}
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
          🔍 AI-Powered Search
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search using natural language - find exactly what you're looking for
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 4,
          background: "rgba(30, 41, 59, 0.6)",
          backdropFilter: "blur(20px)",
          border: "2px solid rgba(20, 184, 166, 0.2)",
          borderRadius: "16px",
          transition: "all 0.3s ease",
          "&:focus-within": {
            border: "2px solid rgba(20, 184, 166, 0.5)",
            boxShadow: "0 12px 24px -8px rgba(20, 184, 166, 0.3)",
            transform: "translateY(-2px)",
          },
        }}>
        <TextField
          fullWidth
          placeholder="What are you looking for?"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#14b8a6", fontSize: 28 }} />
              </InputAdornment>
            ),
            sx: {
              fontSize: "1.1rem",
              "& fieldset": { border: "none" },
            },
          }}
          autoFocus
        />
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}>
          <CircularProgress sx={{ color: "#14b8a6", mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Searching through your content...
          </Typography>
        </Box>
      )}

      {/* Results */}
      {data && !isLoading && (
        <Box>
          <Box
            mb={3}
            p={2}
            sx={{
              background: alpha("#14b8a6", 0.1),
              border: `1px solid ${alpha("#14b8a6", 0.2)}`,
              borderRadius: "12px",
            }}>
            <Typography variant="h6" fontWeight={600} color="#14b8a6">
              {data.count} result{data.count !== 1 ? "s" : ""} found
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {data.results.map((item: Content, index: number) => (
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

      {/* Empty State - No Query */}
      {!query && !isLoading && (
        <Box
          textAlign="center"
          py={8}
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
            <SearchIcon sx={{ fontSize: 60, color: "#14b8a6" }} />
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Start typing to search
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Use natural language to find exactly what you're looking for
          </Typography>
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={1}
              mb={2}>
              <TrendingUp sx={{ color: "#14b8a6", fontSize: 20 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}>
                Try these examples:
              </Typography>
            </Box>
            <Box
              display="flex"
              flexWrap="wrap"
              gap={1.5}
              justifyContent="center"
              maxWidth="600px"
              mx="auto">
              {exampleSearches.map((example, index) => (
                <Chip
                  key={example}
                  label={example}
                  onClick={() => handleSearch(example)}
                  sx={{
                    background: alpha("#14b8a6", 0.1),
                    border: `1px solid ${alpha("#14b8a6", 0.2)}`,
                    color: "text.primary",
                    fontWeight: 500,
                    transition: "all 0.3s ease",
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
                    "&:hover": {
                      background: alpha("#14b8a6", 0.2),
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 16px -4px ${alpha("#14b8a6", 0.3)}`,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Empty State - No Results */}
      {query && !isLoading && data?.count === 0 && (
        <Box
          textAlign="center"
          py={8}
          sx={{
            animation: "fadeIn 0.6s ease-out",
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
              width: "100px",
              height: "100px",
              borderRadius: "20px",
              background: alpha("#ef4444", 0.1),
              border: `2px solid ${alpha("#ef4444", 0.2)}`,
              mb: 3,
            }}>
            <Typography variant="h2">🔍</Typography>
          </Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            No results found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Try different keywords or check your spelling
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Searched for: <strong>"{query}"</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
