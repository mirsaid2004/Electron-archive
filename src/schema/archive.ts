import z from "zod";

export const ArchiveDocumentSchema = z.object({
  docSerialNumber: z.string({ required_error: "T/R kiriting" }),
  docApplicationNumber: z.string({
    required_error: "Talabnoma raqamini kiriting",
  }),
  docLocker: z.string({ required_error: "Shkafni kiriting" }),
  docShelf: z.string({ required_error: "Polkani kiriting" }),
  docCollection: z.string({ required_error: "To'plamni kiriting" }),
});

export type ArchiveDocumentType = z.infer<typeof ArchiveDocumentSchema>;

export const ArchiveDocumentsCollectionSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z
      .object({
        $id: z.string(),
        $permissions: z.array(z.string()),
        $createdAt: z.string(),
        $updatedAt: z.string(),
        $databaseId: z.string(),
        $collectionId: z.string(),
      })
      .extend(ArchiveDocumentSchema.shape)
  ),
  total: z.number(),
});

export type ArchiveDocumentsCollectionType = z.infer<
  typeof ArchiveDocumentsCollectionSchema
>;

export const ArchiveDocumentsCollectionErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

export type ArchiveDocumentsCollectionErrorType = z.infer<
  typeof ArchiveDocumentsCollectionErrorSchema
>;
