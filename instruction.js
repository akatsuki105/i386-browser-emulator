import { get_code8, set_register8, get_code32, set_register32 } from "./emulator_function.js";

let instructions = (new Array(256)).fill(0);

function movR8Imm8(emu) {
    let reg = get_code8(emu, 0) - 0xB0;
    set_register8(emu, reg, get_code8(emu, 1));
    emu.eip += 2;
}

function movR32Imm32(emu) {
    let reg = get_code8(emu, 0) - 0xB8;
    let value = get_code32(emu, 1);
    set_register32(emu, reg, value);
    emu.eip += 5;
}

function shortJump(emu) {
    let diff = get_code8(emu, 1);
    emu.eip += (diff + 2); // 2 = JMP + address
}

for (let i = 0; i < 8; i++) {
    instructions[0xB0 + i] = movR8Imm8;
}
for (let i = 0; i < 8; i++) {
    instructions[0xB8 + i] = movR32Imm32;
}

instructions[0xEB] = shortJump;

export default instructions;
