-- CreateIndex
ALTER INDEX "CarSpecsReference_brand_model_engine_idx" RENAME TO "CarSpecsReference_brand_model_engine_idx_tmp";

-- CreateIndex
CREATE UNIQUE INDEX "CarSpecsReference_brand_model_engine_key" ON "CarSpecsReference"("brand", "model", "engine");
