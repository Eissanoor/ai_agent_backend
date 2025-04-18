module.exports = {
    server: {
        port: process.env.PORT || 8000,
        host: process.env.HOST || 'localhost'
    },
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    audio: {
        maxSize: '50mb',
        supportedFormats: ['wav', 'mp3', 'ogg']
    }
};
