import { get_code8, get_code32 } from "./emulator_function";

class ModRM {
    constructor() {
        this.mod = 0;

        this.opecode = 0;
        this.regIndex = 0;

        this.rm = 0;

        this.sib = 0;

        this.disp8 = 0;
        this.disp32 = 0;
    }
}

function parseModRM(emu, modrm) {
    let code = get_code8(emu, 0);
    modrm.mod = ((code & 0xc0) >> 6);
    modrm.opecode = ((code & 0x38) >> 3);
    modrm.rm = code & 0x07;

    emu.eip += 1;

    if (modrm.mod != 3 && modrm.rm == 4) {
        modrm.sib = get_code8(emu, 0);
        emu.eip += 1;
    }

    if ((modrm.mod == 0 && modrm.rm == 5) || modrm.mod == 2) {
        modrm.disp32 = get_code32(emu, 0);
        emu.eip += 4;
    } else if (modrm.mod == 1) {
        modrm.disp8 = get_code8(emu, 0);
        emu.eip += 1;
    }
}
