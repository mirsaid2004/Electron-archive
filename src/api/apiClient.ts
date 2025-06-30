import { sleep } from "@/helper/sleep";
import { databases } from "@/lib/appwrite-config";
import {
  ArchiveDocumentsCollectionErrorSchema,
  ArchiveDocumentsCollectionSchema,
  ArchiveDocumentType,
} from "@/schema/archive";
import { ID } from "appwrite";

class AppwriteRequests {
  private databaseID;
  private collectionID;

  constructor(databaseID: string, collectionID: string) {
    this.databaseID = databaseID;
    this.collectionID = collectionID;
  }

  async getDocuments(queries: string[] = []) {
    try {
      const result = await databases.listDocuments(
        this.databaseID,
        this.collectionID,
        queries
      );

      return ArchiveDocumentsCollectionSchema.parse({
        success: true,
        data: result.documents,
        total: result.total,
      });
    } catch (err) {
      const error = err as Error;
      console.error(error);
      return ArchiveDocumentsCollectionErrorSchema.parse({
        success: false,
        error: error.toString(),
      });
    }
  }

  async createDocument(data: ArchiveDocumentType) {
    try {
      const promise = await databases.createDocument(
        this.databaseID,
        this.collectionID,
        ID.unique(),
        data
      );
      return { success: true, data: promise };
    } catch (err) {
      const error = err as Error;
      console.error(error);
      return { success: false, error: error.toString() };
    }
  }

  async createListOfDocuments(dataList: ArchiveDocumentType[]) {
    try {
      const promises = dataList.map((data) =>
        databases.createDocument(
          this.databaseID,
          this.collectionID,
          ID.unique(),
          data
        )
      );
      // throttle 10ms between each request
      const throttledPromises = promises.map((promise, index) => async () => {
        await sleep(10 * index); // Sleep for 10ms multiplied by the index to stagger requests
        return await promise;
      });
      const results = await Promise.all(throttledPromises);
      return { success: true, data: results };
    } catch (error) {
      console.error("Error creating documents:", error);
      return { success: false, error: error as Error };
    }
  }

  async updateDocument(documentId: string, data: ArchiveDocumentType) {
    try {
      const promise = await databases.updateDocument(
        this.databaseID,
        this.collectionID,
        documentId,
        data
      );
      return { success: true, data: promise };
    } catch (error) {
      console.error("Error updating document:", error);
      return { success: false, error: error as Error };
    }
  }

  async deleteDocument(documentId: string) {
    try {
      const promise = await databases.deleteDocument(
        this.databaseID,
        this.collectionID,
        documentId
      );
      return { success: true, data: promise };
    } catch (error) {
      console.error("Error deleting document:", error);
      return { success: false, error: error as Error };
    }
  }

  async deleteMultipleDocuments(documentsId: string[]) {
    try {
      const deletePromises = documentsId.map((id) => this.deleteDocument(id));

      // throttle 10ms between each delete request
      const throttledPromises = deletePromises.map(
        (promise, index) => async () => {
          await sleep(10 * index);
          return await promise;
        }
      );

      const results = await Promise.all(throttledPromises);
      return { success: true, data: results };
    } catch (error) {
      console.error("Error deleting multiple documents:", error);
      return { success: false, error: error as Error };
    }
  }

  async clearCollection() {
    try {
      const documents = await this.getDocuments();

      if (!documents.success) {
        throw documents.error;
      }

      // throttle 10ms between each delete request
      const deletePromises = documents.data.map((doc, index) => async () => {
        await sleep(10 * index);
        return await this.deleteDocument(doc.$id);
      });

      await Promise.all(deletePromises);

      return { success: true, message: "Collection cleared successfully" };
    } catch (error) {
      console.error("Error clearing collection:", error);
      return { success: false, error: error as Error };
    }
  }

  async resetCollectionData(dataList: ArchiveDocumentType[]) {
    try {
      const clearResult = await this.clearCollection();
      if (!clearResult.success) {
        throw clearResult.error;
      }

      const createResult = await this.createListOfDocuments(dataList);
      if (!createResult.success) {
        throw createResult.error;
      }

      return { success: true, message: "Collection data reset successfully" };
    } catch (error) {
      console.error("Error resetting collection data:", error);
      return { success: false, error: error as Error };
    }
  }
}

export const appwriteRequests = new AppwriteRequests(
  import.meta.env.VITE_APPWRITE_DATABASE_ARCHIVE_ID,
  import.meta.env.VITE_APPWRITE_DATABASE_ARCHIVE_COLLECTION_ID
);
