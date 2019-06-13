import { get_code8, set_register8 } from "./emulator_function.js";

let instructions = (new Array(256)).fill(null);

function movR8Imm8(emu)
{
    let reg = get_code8(emu, 0) - 0xB0;
    set_register8(emu, reg, get_code8(emu, 1));
    emu.eip += 2;
}

for (let i = 0; i < 8; i++) {
    instructions[0xB0 + i] = movR8Imm8;
}

export default instructions;
