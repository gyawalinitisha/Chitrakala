// Socket.io singleton — init once in index.js, import getIO() anywhere
let _io = null;

const initSocket = (io) => {
    _io = io;
};

const getIO = () => _io;

module.exports = { initSocket, getIO };
