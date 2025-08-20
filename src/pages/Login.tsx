import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Input, Button, Stack } from "@mui/joy";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "fongg" && password === "Keo0809@#") {
      localStorage.setItem("admin", "true");
      navigate("/admin");
    } else {
      alert("Wrong username or password!");
    }
  };

  return (
    <Stack justifyContent="center" alignItems="center" sx={{ minHeight: "100vh", bgcolor: "#000" }}>
      <Card sx={{ width: 320, p: 2, boxShadow: "md", bgcolor: "#121212" }}>
        <CardContent>
          <Typography level="h4" component="h1" mb={2} sx={{ color: "#fff" }}>
            Admin Login
          </Typography>
          <Stack spacing={2}>
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleLogin} variant="solid" color="primary">
              Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
