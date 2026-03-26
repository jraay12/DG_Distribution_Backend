import server from "./app";

const PORT = Number(process.env.PORT) || 8000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on all interfaces on port ${PORT}`);
});
