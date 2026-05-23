import app from "./app.js";
import { env } from "./app/config/env.js";
import { seedSuperAdmin } from "./app/utils/seed.js";

const bootstrap = async () => {
  try {
    await seedSuperAdmin();
    app.listen(env.PORT, () => {
      console.log(`\n🚀 MentorHub Backend running on http://localhost:${env.PORT}`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`❤️  Health: http://localhost:${env.PORT}/health`);
      console.log(`🔗 API: http://localhost:${env.PORT}/api/v1\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

bootstrap();
