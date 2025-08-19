
import RandomFood from "./pages/RandomFood";
import type { Food } from "./components/FoodCard";
import { Box } from "@mui/material";
import "./App.css"; // Optional: import your CSS styles

const foodList: Food[] = [
  { name: "Hot Pot" },
  { name: "Bok L'hong" },
  { name: "Pong Morn" },
  { name: "Bay Chha" },
  { name: "Mi Hel" },
  { name: "Mi Kork" },
  { name: "Nom Pjok" },
  { name: "P'het" },
  { name: "Chha Kdav" },
  { name: "Mi Chha" },
  { name: "Bok L'hong nv Kep" },
  { name: "Merk Ang nv Kampot" },
];

function App() {
  return (
    <Box
      sx={{
        height: "100vh",            // full viewport height
        display: "flex",
        justifyContent: "center",   // horizontal center
        alignItems: "center",       // vertical center
        backgroundColor: "#000000ff" // optional: light background
      }}
    >
      <RandomFood foods={foodList} />
    </Box>
  );
}

export default App;
