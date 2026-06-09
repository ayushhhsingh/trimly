import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma, withRetry } from "@/lib/prisma"

const createErrorResponse = (message: string, status: number) => {
    return NextResponse.json({message}, {status})
}

export async function GET(request: NextRequest){
    const { userId } = getAuth(request)
    if (!userId) {
        return createErrorResponse("Unauthorized", 401)
    }

    try {
        const videos = await withRetry(
            () =>
                prisma.video.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                }),
            { label: "videos.list", retries: 3, delayMs: 2000 }
        )
        return NextResponse.json(videos)
    } catch (error) {
        console.error("Error fetching videos", error)
        return createErrorResponse("Error fetching videos", 500)
    }
}
