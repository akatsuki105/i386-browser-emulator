export function io_in8(address) {
    switch (address) {
        case 0x03f8:
            return 0x71; // 0x71 => q
        default:
            return 0;
    }
}

export function io_out8(address, value) {
    switch (address) {
        case 0x03f8:
            return console.log(`ioOut8 ${value}`);
        default:
            return 0;
    }
}