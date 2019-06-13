import { get_code8, get_code32, set_register32, get_register32, get_memory32, set_memory32 } from "./emulator_function.js";

export class ModRM {
    constructor() {
        this.mod = 0;

        this.opecode = 0;

        this.rm = 0;

        this.sib = 0;

        this.disp8 = 0;
        this.disp32 = 0;
    }
}

export function parseModRM(emu, modrm) {
    let code = get_code8(emu, 0);
    modrm.mod = ((code & 0xc0) >> 6);
    modrm.opecode = ((code & 0x38) >> 3);
    modrm.rm = code & 0x07;

    emu.eip += 1;

    // SIBビットを参照する必要があるとき
    if (modrm.mod != 3 && modrm.rm == 4) {
        modrm.sib = get_code8(emu, 0);
        emu.eip += 1;
    }

    // dispビットを参照する必要があるとき
    if ((modrm.mod == 0 && modrm.rm == 5) || modrm.mod == 2) {
        modrm.disp32 = get_code32(emu, 0);
        emu.eip += 4;
    } else if (modrm.mod == 1) {
        modrm.disp8 = get_code8(emu, 0);
        emu.eip += 1;
    }
}

export function calcMemoryAddress(emu, modrm) {
    if (modrm.mod == 0) {
        if (modrm.rm == 4) {
            throw new Error("not implemented ModRM mod = 0, rm = 4");
        } else if (modrm.rm == 5) {
            return modrm.disp32;
        } else {
            return get_register32(emu, modrm.rm);
        }
    } else if (modrm.mod == 1) {
        if (modrm.mod == 4) {
            throw new Error("not implemented ModRM mod = 1, rm = 4");
        } else {
            return get_register32(emu, modrm.rm) + modrm.disp8;
        }
    } else if (modrm.mod == 2) {
        if (modrm.rm == 4) {
            throw new Error("not implemented ModRM mod = 2, rm = 4");
        } else {
            return get_register32(emu, modrm.rm) + modrm.disp32;
        }
    } else {
        throw new Error("not implemented ModRM mod = 3");
    }
} 

export function setRm32(emu, modrm, value) {
    if (modrm.mod == 3) {
        set_register32(emu, modrm.rm, value);
    } else {
        let address = calcMemoryAddress(emu, modrm);
        set_memory32(emu, address, value);
    }
}

export function getRm32(emu, modrm) {
    if (modrm.mod == 3) {
        return get_register32(emu, modrm.rm);
    } else {
        let address = calcMemoryAddress(emu, modrm);
        return get_memory32(emu, address);
    }
}

export function setR32(emu, modrm, value) {
    set_register32(emu, modrm.opecode, value);
}

export function getR32(emu, modrm) {
    return get_register32(emu, modrm.opecode);
}
