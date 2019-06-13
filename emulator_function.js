export function get_code8(emu, index) {
    return emu.memory[emu.eip + index];
}

export function get_code32(emu, index) {
    let code32 = 0;

    for (let i = 0; i < 4; i++) {
        code32 |= get_code8(emu, index + i) << (i * 8);
    }
    return code32;
}

export function get_register8(emu, index) {
    if (index < 4) {
        return emu.registers[index] & 0xff;
    } else {
        return (emu.registers[index - 4] >> 8) & 0xff;
    }
}

export function get_register32(emu, index) {
    return emu.registers[index];
}

export function set_register8(emu, index, value) {
    if (index < 4) {
        r = emu.registers[index] & 0xffffff00;
        emu.registers[index] = r | value;
    } else {
        r = emu.registers[index -4] & 0xffff00ff;
        emu.registers[index-4] = r | (value << 8);
    }
}

export function set_register32(emu, index, value) {
    emu.registers[index] = value;
}
