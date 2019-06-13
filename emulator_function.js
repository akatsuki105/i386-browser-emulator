const Register = {
    "EAX": 0,
    "ECX": 1,
    "EDX": 2,
    "EBX": 3,
    "ESP": 4,
    "EBP": 5,
    "ESI": 6,
    "EDI": 7,
    "REGISTERS_COUNT": 8,
    "AL": 0,
    "CL": 1,
    "DL": 2,
    "BL": 3,
    "AH": 5,
    "CH": 6,
    "DH": 7,
    "BH": 8
};

export function get_code8(emu, index) {
    return emu.memory[emu.eip + index];
}

export function get_sign_code8(emu, index) {
    let unsign_code8 = emu.memory[emu.eip + index];
    if (unsign_code8 >= (1 << 7)) {
        return -(((~unsign_code8) + 1) & 0x00ff);
    } else {
        return unsign_code8;
    }
}

export function get_code32(emu, index) {
    let code32 = 0;

    for (let i = 0; i < 4; i++) {
        code32 |= get_code8(emu, index + i) << (i * 8);
    }
    return code32;
}

export function get_sign_code32(emu, index) {
    let unsign_code32 = get_code32(emu, index);
    if (unsign_code32 >= (1 << 31)) {
        return -(((~unsign_code32) + 1) & 0xffffffff);
    } else {
        return unsign_code32;
    }
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

export function get_memory8(emu, address) {
    return emu.memory[address];
}

export function get_memory32(emu, address) {
    let memory32 = 0;
    for (let i = 0; i < 4; i++) {
        memory32 |= get_memory8(emu, address + i) << (i * 8);
    }
    return memory32;
}

export function set_memory8(emu, address, value) {
    emu.memory[address] = value & 0xff;
}

export function set_memory32(emu, address, value) {
    for (let i = 0; i < 4; i++) {
        set_memory8(emu, address + i, value >> (i * 8));
    }
}

export function push32(emu, value) {
    let address = get_register32(emu, Register.ESP);
    set_register32(emu, Register.ESP, address);
    set_memory32(emu, address, value);
}

export function pop32(emu) {
    let address = get_register32(emu, Register.ESP);
    let value = get_memory32(emu, address);
    set_register32(emu, Register.ESP, address + 4);
    return value;
}
