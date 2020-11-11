// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3001;


// ============================
// Entorno
// ============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';


// ============================
// Base de datos
// ============================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe2';
} else {
    urlDB = 'mongodb+srv://juannome:KwFmjYZ4b8bHQ17n@cluster0.g73xc.mongodb.net/cafe-2';
}
process.env.URL_DB = urlDB;