import {readFileSync} from "fs";
import {dirname, join} from "path";
import {fileURLToPath} from "url";

const pkgPath = join(process.cwd(), "package.json");
let pkgContent: string;

try {
    // Try to read from the current working directory first
    pkgContent = readFileSync(pkgPath, "utf-8");
} catch {
    // Fallback: try to read from the source directory
    const __filename = fileURLToPath(import.meta.url);
    const sourceDir = dirname(__filename);
    const fallbackPath = join(sourceDir, "..", "..", "package.json");
    pkgContent = readFileSync(fallbackPath, "utf-8");
}

const pkg = JSON.parse(pkgContent);

/**
 * Get the current version from package.json
 * @returns Version string from package.json
 */
export function getVersion(): string {
    return pkg.version;
}