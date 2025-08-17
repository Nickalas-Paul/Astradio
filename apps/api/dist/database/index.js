"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let db = null;
async function initializeDatabase() {
    if (db) {
        return db;
    }
    // Ensure database directory exists
    const dbDir = path_1.default.join(process.cwd(), 'data');
    if (!fs_1.default.existsSync(dbDir)) {
        fs_1.default.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = process.env.DATABASE_URL || path_1.default.join(dbDir, 'astroaudio.db');
    db = await (0, sqlite_1.open)({
        filename: dbPath,
        driver: sqlite3_1.default.Database
    });
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    // Read and execute schema - use absolute paths
    const possiblePaths = [
        path_1.default.join(__dirname, 'schema.sql'), // dist/database/schema.sql
        path_1.default.join(process.cwd(), 'src', 'database', 'schema.sql'), // src/database/schema.sql
        path_1.default.join(process.cwd(), 'apps', 'api', 'src', 'database', 'schema.sql'), // full path
        path_1.default.join(process.cwd(), 'apps', 'api', 'dist', 'database', 'schema.sql') // copied path
    ];
    let schemaPath = null;
    for (const p of possiblePaths) {
        if (fs_1.default.existsSync(p)) {
            schemaPath = p;
            break;
        }
    }
    console.log('🔍 Looking for schema.sql at:', possiblePaths);
    console.log('📁 Current directory:', process.cwd());
    console.log('📁 __dirname:', __dirname);
    if (!schemaPath) {
        console.error('❌ Schema file not found at any location');
        throw new Error(`Schema file not found. Tried: ${possiblePaths.join(', ')}`);
    }
    console.log('✅ Found schema at:', schemaPath);
    const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
    // Execute the entire schema as one statement to avoid parsing issues
    try {
        await db.exec(schema);
        console.log('✅ Database schema executed successfully');
    }
    catch (error) {
        console.error('❌ Database schema execution failed:', error);
        throw error;
    }
    console.log('✅ Database initialized successfully');
    return db;
}
async function getDatabase() {
    if (!db) {
        return await initializeDatabase();
    }
    return db;
}
async function closeDatabase() {
    if (db) {
        await db.close();
        db = null;
    }
}
//# sourceMappingURL=index.js.map