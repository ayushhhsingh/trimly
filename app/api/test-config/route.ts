import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    cloudinary: {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing",
      api_key: process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing",
    },
    clerk: {
      publishable_key: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "✓ Set" : "✗ Missing",
      secret_key: process.env.CLERK_SECRET_KEY ? "✓ Set" : "✗ Missing",
    },
    database: {
      url: process.env.DATABASE_URL ? "✓ Set" : "✗ Missing",
    },
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }

  const hasAllCredentials = 
    config.cloudinary.cloud_name === "✓ Set" &&
    config.cloudinary.api_key === "✓ Set" &&
    config.cloudinary.api_secret === "✓ Set" &&
    config.clerk.publishable_key === "✓ Set" &&
    config.clerk.secret_key === "✓ Set" &&
    config.database.url === "✓ Set"

  return NextResponse.json({
    success: hasAllCredentials,
    config,
    message: hasAllCredentials 
      ? "All credentials configured!" 
      : "Some credentials are missing - check .env file"
  })
}
