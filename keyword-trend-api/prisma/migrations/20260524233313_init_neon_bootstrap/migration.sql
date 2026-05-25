-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "searchVolume" INTEGER NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cpc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trendScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "velocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "direction" TEXT NOT NULL DEFAULT 'flat',
    "source" TEXT NOT NULL DEFAULT 'google_trends',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trend" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "interest" INTEGER NOT NULL,
    "volume" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'google_trends',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySnapshot" (
    "id" TEXT NOT NULL,
    "keywordId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "interest" INTEGER NOT NULL,
    "volume" INTEGER,
    "velocity7d" DOUBLE PRECISION,
    "velocity30d" DOUBLE PRECISION,
    "peakInterest" INTEGER,
    "direction7d" TEXT,
    "direction30d" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendingTopic" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "category" TEXT,
    "interest" INTEGER NOT NULL,
    "volume" INTEGER,
    "velocity" DOUBLE PRECISION NOT NULL,
    "direction" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'google_trends',
    "region" TEXT NOT NULL DEFAULT 'US',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendingTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_term_key" ON "Keyword"("term");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_slug_key" ON "Keyword"("slug");

-- CreateIndex
CREATE INDEX "Keyword_term_idx" ON "Keyword"("term");

-- CreateIndex
CREATE INDEX "Keyword_category_idx" ON "Keyword"("category");

-- CreateIndex
CREATE INDEX "Keyword_trendScore_idx" ON "Keyword"("trendScore");

-- CreateIndex
CREATE INDEX "Keyword_velocity_idx" ON "Keyword"("velocity");

-- CreateIndex
CREATE INDEX "Keyword_direction_idx" ON "Keyword"("direction");

-- CreateIndex
CREATE INDEX "Trend_keywordId_date_idx" ON "Trend"("keywordId", "date");

-- CreateIndex
CREATE INDEX "Trend_date_idx" ON "Trend"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Trend_keywordId_date_source_key" ON "Trend"("keywordId", "date", "source");

-- CreateIndex
CREATE INDEX "DailySnapshot_keywordId_date_idx" ON "DailySnapshot"("keywordId", "date");

-- CreateIndex
CREATE INDEX "DailySnapshot_date_idx" ON "DailySnapshot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySnapshot_keywordId_date_key" ON "DailySnapshot"("keywordId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "TrendingTopic_capturedAt_idx" ON "TrendingTopic"("capturedAt");

-- CreateIndex
CREATE INDEX "TrendingTopic_category_idx" ON "TrendingTopic"("category");

-- CreateIndex
CREATE INDEX "TrendingTopic_velocity_idx" ON "TrendingTopic"("velocity");

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trend" ADD CONSTRAINT "Trend_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySnapshot" ADD CONSTRAINT "DailySnapshot_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "Keyword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
