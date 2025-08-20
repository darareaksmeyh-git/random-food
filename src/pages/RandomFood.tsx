import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Button from "@mui/joy/Button";
import {supabase} from "../../supabaseClient"

// Define Food type
interface Food {
  id: number;
  name: string;
}


const RandomFood: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [currentName, setCurrentName] = useState<string>("");
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch from Supabase
  const fetchFoods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("foods").select("*");
      if (error) throw error;
      setFoods(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleRandomPick = () => {
    if (spinning || foods.length === 0) return;

    setSpinning(true);

    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * foods.length);
      setCurrentName(foods[randomIndex].name);
    }, 50);

    setTimeout(() => {
      clearInterval(spinInterval);
      const finalIndex = Math.floor(Math.random() * foods.length);
      setCurrentName(foods[finalIndex].name);
      setSpinning(false);
    }, 1000);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 4,
      }}
    >
      <Typography
        variant="h3"
        sx={{ minWidth: 200, textAlign: "center", color: "#ffffff" }}
      >
        {currentName || "Pick a food!"}
      </Typography>

      <Button
        variant="soft"
        color="primary"
        onClick={handleRandomPick}
        disabled={loading || foods.length === 0}
        sx={{ fontWeight: "bold" }}
      >
        {loading ? "Jam Tix..." : "Spin Food"}
      </Button>
    </Box>
  );
};

export default RandomFood;
