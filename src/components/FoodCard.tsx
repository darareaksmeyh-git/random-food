import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export type Food = {   // 👈 exported so others can import it
  name: string;
};

type FoodCardProps = {
  food: Food;
};

const FoodCard: React.FC<FoodCardProps> = ({ food }) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      {/* <CardMedia
        component="img"
        height="200"
        image={food.image}
        alt={food.name}
      /> */}
      <CardContent>
        <Typography variant="h6" align="center">
          {food.name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FoodCard;
