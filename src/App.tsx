import RandomFood from "./pages/RandomFood";
import { Box } from "@mui/material";
import "./App.css";

function App() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000ff",
      }}
    >
      <RandomFood />
    </Box>
  );
}

export default App;
