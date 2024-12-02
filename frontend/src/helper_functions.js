import CryptoJS from "crypto-js";
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

export function encryptMessage(message, secretKey) {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
}
export function decryptMessage(encryptedMessage, secretKey) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
    catch {
        return encryptedMessage;
    }
}

const apiKey = "AIzaSyDT7bvq6tWlQsf9-3-uwGxWYCO9VHGAGQI"

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const summarize = async (prompt) => {
    const res = await model.generateContent(prompt);
    return res.response.text();
}
export default summarize
