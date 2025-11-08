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
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
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

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        🔍 AI-Powered Search
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Search using natural language - try "articles about AI from last month"
        or "black shoes under $300"
      </Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 4, border: "2px solid #e0e0e0" }}>
        <TextField
          fullWidth
          placeholder="What are you looking for?"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          autoFocus
        />
      </Paper>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {data && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {data.count} result{data.count !== 1 ? "s" : ""} found
          </Typography>
          <Grid container spacing={3} mt={1}>
            {data.results.map((item: Content) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <ContentCard content={item} onUpdate={refetch} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {!query && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Start typing to search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use natural language to find exactly what you're looking for
          </Typography>
          <Box mt={3}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={1}>
              Try these examples:
            </Typography>
            {[
              "articles about React I saved last week",
              "todo list from yesterday",
              "inspiration for logo design",
              "black leather shoes under $300",
            ].map((example) => (
              <Chip
                key={example}
                label={example}
                onClick={() => handleSearch(example)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </Box>
      )}

      {query && !isLoading && data?.count === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try different keywords or check your spelling
          </Typography>
        </Box>
      )}
    </Box>
  );
}
