// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3001;


// ============================
// Entorno
// ============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
// ======================================
// Fecha de Vencimiento del token
// ======================================
// 60 minutos // 60 minutos // 24 horas // 30 dias

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
// ======================================
// Seed de autenticacion
// ======================================
process.env.SEED = process.env.SEED || 'que-viva-el-perico';
// ======================================
// Base de datos
// ======================================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe2';
} else {
    urlDB = process.env.MONDO_URI;
}
process.env.URL_DB = urlDB;