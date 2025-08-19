import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import Button from '@mui/joy/Button';
import type { Food } from "../components/FoodCard";

type RandomFoodProps = {
  foods: Food[];
};

const RandomFood: React.FC<RandomFoodProps> = ({ foods }) => {
  const [currentName, setCurrentName] = useState<string>("");
  const [spinning, setSpinning] = useState(false);

  const handleRandomPick = () => {
  if (spinning) return; // prevent double click

  setSpinning(true);

  const spinInterval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * foods.length);
    setCurrentName(foods[randomIndex].name);
  }, 50); // change name every 100ms

  // stop spinning after ~2 seconds
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
      <Typography variant="h3" sx={{ minWidth: 200, textAlign: "center" }} sx={{color: "#ffffff"}}>
        {currentName || "Pick a food!"}
      </Typography>

      <Button variant="soft" color="primary" onClick={handleRandomPick} >
        Spin Food
      </Button>
    </Box>
  );
};

export default RandomFood;
