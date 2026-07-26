import Crytr from "cryptr";

const cryptr = new Crytr(process.env.ENCRYTION_KEY!);

export const encryptr = (text: string) => cryptr.encrypt(text);
export const decrypt = (text: string) => cryptr.decrypt(text);