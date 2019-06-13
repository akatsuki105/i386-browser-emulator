function ioIn8(address) {
    switch (address) {
        case 0x03f8:
            return console.log("hello ioIn8");
        default:
            return 0;
    }
}

function ioOut8(address, value) {
    switch (address) {
        case 0x03f8:
            return console.log(`ioOut8 ${value}`);
        default:
            return 0;
    }
}