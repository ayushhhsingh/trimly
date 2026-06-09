ALTER TABLE "Video"
ADD COLUMN "userId" TEXT;

ALTER TABLE "Video"
ALTER COLUMN "originalSize" TYPE INTEGER USING "originalSize"::INTEGER,
ALTER COLUMN "compressedSize" TYPE INTEGER USING "compressedSize"::INTEGER,
ALTER COLUMN "duration" TYPE DOUBLE PRECISION USING "duration"::DOUBLE PRECISION;

CREATE INDEX "Video_userId_idx" ON "Video"("userId");
