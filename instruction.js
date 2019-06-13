import { get_code8, set_register8, get_code32, set_register32, get_sign_code8, get_sign_code32, get_register32, push32, pop32 } from "./emulator_function.js";
import { ModRM, parseModRM, setRm32, getR32, getRm32, setR32 } from "./modrm.js";

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

function movR32Rm32(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);
    let rm32 = getRm32(emu, modrm);
    setR32(emu, modrm, rm32);
}

function movRm32Imm32(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);
    let value = get_code32(emu, 0);
    emu.eip += 4;
    setRm32(emu, modrm, value);
}

function movRm32R32(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);
    let r32 = getR32(emu, modrm);
    setRm32(emu, modrm, r32);
}

function shortJump(emu) {
    let diff = get_sign_code8(emu, 1);
    emu.eip += (diff + 2); // 2 = JMP + address
}

function nearJump(emu) {
    let diff = get_sign_code32(emu, 1);
    emu.eip += (diff + 5);
}

function addRm32R32(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);
    let r32 = getR32(emu, modrm);
    let rm32 = getRm32(emu, modrm);
    setRm32(emu, modrm, rm32 + r32);
}

function addRm32Imm8(emu, modrm) {
    let rm32 = getRm32(emu, modrm);
    let imm8 = get_sign_code32(emu, 0);
    emu.eip += 1;
    set_register32(emu, modrm, rm32 + imm8);
}

function subRm32Imm8(emu, modrm) {
    let rm32 = getRm32(emu, modrm);
    let imm8 = get_sign_code8(emu, 0);
    emu.eip += 1;
    setRm32(emu, modrm, rm32 - imm8);
}

function code83(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);

    switch (modrm.opecode) {
        case 0:
            addRm32Imm8(emu, modrm);
        case 5:
            subRm32Imm8(emu, modrm);
            break;
        default:
            throw new Error(`not implemented 83 ${modrm.opecode}`);
    }
}

function incRm32(emu, modrm) {
    let value = getRm32(emu, modrm);
    setRm32(emu, modrm, value + 1);
}

function decRm32(emu, modrm) {
    let value = getRm32(emu, modrm);
    setRm32(emu, modrm, value - 1);
}

function codeff(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);

    switch (modrm.opecode) {
        case 0:
            incRm32(emu, modrm);
            break;
        case 1:
            decRm32(emu, modrm);
            break;
        default:
            throw new Error(`not implemented FF ${modrm.opecode}`);
    }
}

function pushR32(emu) {
    let reg = get_code8(emu, 0) - 0x50;
    push32(emu, get_register32(emu, reg));
    emu.eip += 1;
}

function popR32(emu) {
    let reg = get_code8(emu, 0) - 0x58;
    set_register32(emu, reg, pop32(emu));
    emu.eip += 1;
}

function pushImm32(emu) {
    let value = get_code32(emu, 1);
    push32(emu, value);
    emu.eip += 5;
}

function pushImm8(emu) {
    let value = get_code8(emu, 1);
    push32(emu, value);
    emu.eip += 2;
}

function callRel32(emu) {
    let diff = get_sign_code32(emu, 1);
    push32(emu, emu.eip + 5);
    emu.eip += (diff + 5);
}

function ret(emu) {
    emu.eip = pop32(emu);
}

function leave(emu) {
    let ebp = get_register32(emu, Register.EBP);
    set_register32(emu, Register.ESP, ebp);
    set_register32(emu, Register.EBP, pop32(emu));
    emu.eip += 1;
}

instructions[0x01] = addRm32R32;

for (let i = 0; i < 8; i++) {
    instructions[0x50 + i] = pushR32;
}
for (let i = 0; i < 8; i++) {
    instructions[0x58 + i] = popR32;
}

instructions[0x68] = pushImm32;
instructions[0x6A] = pushImm8;

instructions[0x83] = code83;
instructions[0x89] = movRm32R32;
instructions[0x8B] = movR32Rm32;

for (let i = 0; i < 8; i++) {
    instructions[0xB0 + i] = movR8Imm8;
}
for (let i = 0; i < 8; i++) {
    instructions[0xB8 + i] = movR32Imm32;
}

instructions[0xC3] = ret;
instructions[0xC7] = movRm32Imm32;
instructions[0xC9] = leave;

instructions[0xE8] = callRel32;
instructions[0xE9] = nearJump;
instructions[0xEB] = shortJump;
instructions[0xFF] = codeff;

export default instructions;
