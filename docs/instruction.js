import { get_code8, set_register8, get_code32, set_register32, get_sign_code8, get_sign_code32, get_register32, push32, pop32, update_eflags_sub, is_sign, is_carry, is_overflow, get_register8, is_zero } from "./emulator_function.js";
import { ModRM, parseModRM, setRm32, getR32, getRm32, setR32, getR8, setRm8, setR8, getRm8 } from "./modrm.js";
import { io_in8, io_out8 } from "./io.js";

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

function movR8Rm8(emu)
{
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);
    let rm8 = getRm8(emu, modrm);
    setR8(emu, modrm, rm8);
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

function cmp_al_imm8(emu) {
    let value = get_code8(emu, 1);
    let al = get_register8(emu, Register.AL);
    let result = al - value;
    update_eflags_sub(emu, al, value, result);
    emu.eip += 2;
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

function movRm8R8(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);
    let r8 = getR8(emu, modrm);
    setRm8(emu, modrm, r8);
}

function subRm32Imm8(emu, modrm) {
    let rm32 = getRm32(emu, modrm);
    let imm8 = get_sign_code8(emu, 0);
    emu.eip += 1;
    let result = rm32 - imm8;
    setRm32(emu, modrm, rm32 - imm8);
    update_eflags_sub(emu, rm32, imm8, result);
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
        case 7: 
            cmpRm32Imm8(emu, modrm);
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

function negRm8(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);
    let value = getRm8(emu, modrm);
    setRm8(emu, modrm, -value);
}

function negRm32(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);
    let value = getRm32(emu, modrm);
    setRm32(emu, modrm, -value);
}

function cmpR32Rm32(emu) {
    emu.eip += 1;
    let modrm = new ModRM();
    parseModRM(emu, modrm);
    let r32 = getR32(emu, modrm);
    let rm32 = getRm32(emu, modrm);
    let result = r32 - rm32;
    update_eflags_sub(emu, r32, rm32, result);
}

function cmpRm32Imm8(emu, modrm) {
    let rm32 = getRm32(emu, modrm);
    let imm8 = get_sign_code8(emu, 0);
    emu.eip += 1;
    let result = rm32 - imm8;
    update_eflags_sub(emu, rm32, imm8, result);
}

function incR32(emu) {
    let reg = get_code8(emu, 0) - 0x40;
    set_register32(emu, reg, get_register32(emu, reg) + 1);
    emu.eip += 1;
}

function jc(emu) {
    let diff = is_carry(emu) ? get_sign_code8(emu, 1) : 0;
    emu.eip += (diff + 2);
}

function jnc(emu) {
    let diff = is_carry(emu) ? 0 : get_sign_code8(emu, 1);
    emu.eip += (diff + 2);
}

function jz(emu) {
    let diff = is_zero(emu) ? get_sign_code8(emu, 1) : 0;
    emu.eip += (diff + 2);
}

function jnz(emu) {
    let diff = is_zero(emu) ? 0 : get_sign_code8(emu, 1);
    emu.eip += (diff + 2);
}

function js(emu) {
    let diff = is_sign(emu) ? get_sign_code8(emu, 1) : 0;
    emu.eip += (diff + 2);
}

function jns(emu) {
    let diff = is_sign(emu) ? 0 : get_sign_code8(emu, 1);
    emu.eip += (diff + 2);
}

function jo(emu) {
    let diff = is_overflow(emu) ? get_sign_code8(emu, 1) : 0;
    emu.eip += (diff + 2);
}

function jno(emu) {
    let diff = is_overflow(emu) ? 0 : get_sign_code8(emu, 1);
    emu.eip += (diff + 2);
}

function jl(emu) {
    let diff = (is_sign(emu) != is_overflow(emu)) ? get_sign_code8(emu, 1) : 0;
    emu.eip += (diff + 2);
}

function jle(emu) {
    let diff = ((is_zero(emu)) || (is_sign(emu) != is_overflow(emu))) ? get_sign_code8(emu, 1) : 0;
    emu.eip += (diff + 2);
}

function in_al_dx(emu) {
    let address = get_register32(emu, Register.EDX) & 0xffff;
    let value = io_in8(address);
    set_register8(emu, Register.AL, value);
    emu.eip += 1;
}

function out_dx_al(emu) {
    let address = get_register32(emu, Register.EDX) & 0xffff;
    let value = get_register8(emu, Register.AL);
    io_out8(address, value);
    emu.eip += 1;
}

instructions[0x01] = addRm32R32;

instructions[0x3B] = cmpR32Rm32;
instructions[0x3C] = cmp_al_imm8;

for (let i = 0; i < 8; i++) {
    instructions[0x40 + i] = incR32;
}

for (let i = 0; i < 8; i++) {
    instructions[0x50 + i] = pushR32;
}
for (let i = 0; i < 8; i++) {
    instructions[0x58 + i] = popR32;
}

instructions[0x68] = pushImm32;
instructions[0x6A] = pushImm8;

instructions[0x70] = jo;
instructions[0x71] = jno;
instructions[0x72] = jc;
instructions[0x73] = jnc;
instructions[0x74] = jz;
instructions[0x75] = jnz;
instructions[0x78] = js;
instructions[0x79] = jns;
instructions[0x7C] = jl;
instructions[0x7E] = jle;

instructions[0x83] = code83;
instructions[0x88] = movRm8R8;
instructions[0x89] = movRm32R32;
instructions[0x8A] = movR8Rm8;
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
instructions[0xEC] = in_al_dx;
instructions[0xF6] = negRm8;
instructions[0xF7] = negRm32;
instructions[0xEE] = out_dx_al;
instructions[0xFF] = codeff;

export default instructions;
