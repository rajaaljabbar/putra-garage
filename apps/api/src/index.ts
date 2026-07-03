// Local dev entry — import from shared api/ source
import app from "../../../api/app";
import { env } from "../../../api/config/env";

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
