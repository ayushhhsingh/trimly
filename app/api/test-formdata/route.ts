import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Test endpoint called")
    console.log("📋 Request method:", request.method)
    console.log("📋 Content-Type:", request.headers.get("content-type"))
    console.log("📋 Content-Length:", request.headers.get("content-length"))

    // Check authentication using getAuth (doesn't consume body)
    const { userId } = getAuth(request)
    console.log("🔍 Auth check - userId:", userId)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in first" },
        { status: 401 }
      )
    }

    // Test FormData parsing
    try {
      const formData = await request.formData()
      console.log("✅ FormData parsed successfully")

      const file = formData.get("file")
      const title = formData.get("title")
      const description = formData.get("description")

      console.log("📦 FormData contents:")
      console.log("   - file:", file ? `${(file as File).name} (${(file as File).size} bytes)` : "null")
      console.log("   - title:", title || "null")
      console.log("   - description:", description || "null")

      if (!file) {
        return NextResponse.json(
          { error: "Bad Request", message: "No file provided" },
          { status: 400 }
        )
      }

      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Bad Request", message: "File is not a valid File object" },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "FormData parsed successfully!",
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
        title: title || "No title",
        description: description || "No description",
      })

    } catch (formDataError: any) {
      console.error("❌ FormData parsing error:", formDataError)
      console.error("Error message:", formDataError.message)
      console.error("Error stack:", formDataError.stack)

      return NextResponse.json(
        {
          error: "FormData Parsing Failed",
          message: formDataError instanceof Error ? formDataError.message : String(formDataError),
          hint: "Make sure the frontend is sending FormData (not JSON) and NOT manually setting Content-Type header"
        },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error("❌ Test endpoint error:", error)
    return NextResponse.json(
      {
        error: "Server Error",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
