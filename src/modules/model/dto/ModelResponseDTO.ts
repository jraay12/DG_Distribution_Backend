export interface ModelResponseDTO {
  id: string;
  brand_id: string;
  model_name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export type ModelWithBrandResponseDTO = Omit<ModelResponseDTO, "brand_id"> & {
  brand_name: string
}