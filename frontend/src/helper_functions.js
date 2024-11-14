import CryptoJS from "crypto-js";
export function encryptMessage(message, secretKey) {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
}
export  function decryptMessage(encryptedMessage, secretKey) {
    try{
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
    }
    catch{
        return encryptedMessage;
    }
} 