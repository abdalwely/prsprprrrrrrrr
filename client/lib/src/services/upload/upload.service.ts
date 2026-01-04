import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../firebase/firebase";

export const uploadService = {
  async uploadImage(file: File, path: string): Promise<string> {
    const fileRef = ref(storage, `images/${path}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  },

  async deleteImage(url: string): Promise<void> {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  },
};
