export interface Video {
    id: string
    userId: string | null
    title: string
    description: string | null
    publicId: string
    originalSize: number
    compressedSize: number
    duration: number
    createdAt: string
    updatedAt: string
}
