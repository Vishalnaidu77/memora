import crypto from "crypto";
import { itemModel } from "../models/item.model.js";

export function normalizeUrl(url) {
    if (!url) return null;

    try {
        const parsedUrl = new URL(url);

        parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
        parsedUrl.hash = "";

        if (parsedUrl.pathname.length > 1) {
            parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, "");
        }

        const filteredParams = [...parsedUrl.searchParams.entries()]
            .filter(([key]) => !key.toLowerCase().startsWith("utm_"))
            .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
                if (leftKey === rightKey) {
                    return leftValue.localeCompare(rightValue);
                }

                return leftKey.localeCompare(rightKey);
            });

        parsedUrl.search = "";
        for (const [key, value] of filteredParams) {
            parsedUrl.searchParams.append(key, value);
        }

        return parsedUrl.toString();
    } catch {
        return url.trim().toLowerCase().replace(/\/+$/, "");
    }
}

export function normalizeText(text) {
    if (!text) return "";

    return text.toLowerCase().trim().replace(/\s+/g, " ");
}

export function sha256(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
}

export function buildSourceFingerprint({ url, fileBuffer }) {
    if (url) {
        const normalizedUrl = normalizeUrl(url);
        return normalizedUrl ? sha256(normalizedUrl) : null;
    }

    if (fileBuffer) {
        return sha256(fileBuffer);
    }

    return null;
}

export function buildContentFingerprint({ title, description, content }) {
    const combinedText = [title, description, content]
        .filter(Boolean)
        .join(". ");

    const normalizedText = normalizeText(combinedText);

    if (!normalizedText) {
        return null;
    }

    return sha256(normalizedText);
}

export async function findExactDuplicate({ userId, sourceFingerprint, contentFingerprint }) {
    if (sourceFingerprint) {
        const sourceDuplicate = await itemModel.findOne({
            userId,
            sourceFingerprint
        });

        if (sourceDuplicate) {
            return sourceDuplicate;
        }
    }

    if (contentFingerprint) {
        const contentDuplicate = await itemModel.findOne({
            userId,
            contentFingerprint
        });

        if (contentDuplicate) {
            return contentDuplicate;
        }
    }

    return null;
}
