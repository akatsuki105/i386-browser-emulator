import { get_code8 } from "./emulator_function.js";
import instructions from "./instruction.js";
import { outputText, resetTextBox } from "./io.js";

const MEMOEY_SIZE = 1024 * 1024;

let memory = [];

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

const registersName = ["EAX", "ECX", "EDX", "EBX", "ESP", "EBP", "ESI", "EDI"];

class Emulator {
    constructor(eip, esp) {
        this.registers = [0, 0, 0, 0, 0, 0, 0, 0];
        this.eflags = 0;
        this.memory = (new Array(MEMOEY_SIZE)).fill(0);
        this.eip = eip;
        this.registers[Register.ESP] = esp;
    }
}

function onAddFile(event) {
    var files;
    var reader = new FileReader();

    if (event.target.files) {
        files = event.target.files;
    } else {
        files = event.dataTransfer.files;
    }

    reader.onload = function (event) {
        var raw = new Uint8Array(reader.result);
        let size = raw.length;
        for (let i = 0; i < size; i++) {
            memory.push(raw[i]);
        }
        mainFunc();
    };
    if (files[0]) {
        reader.readAsArrayBuffer(files[0]);
        document.getElementById("inputfile").value = '';
    }
}

function readBinary(emu, memory) {
    let size = memory.length;
    for (let i = 0; i < size; i++) {
        emu.memory[0x7c00 + i] = memory[i]; 
    }
}

function writeEmu(emu) {
    document.getElementById('consoleOutput').append(`EAX: ${(emu.registers[Register.EAX]).toString(16)}\n`);
    document.getElementById('consoleOutput').append(`ECX: ${(emu.registers[Register.ECX]).toString(16)}\n`);
    document.getElementById('consoleOutput').append(`EDX: ${(emu.registers[Register.EDX]).toString(16)}\n`);
    document.getElementById('consoleOutput').append(`EBX: ${(emu.registers[Register.EBX]).toString(16)}\n`);
    document.getElementById('consoleOutput').append(`ESP: ${(emu.registers[Register.ESP]).toString(16)}\n`);
    document.getElementById('consoleOutput').append(`EBP: ${(emu.registers[Register.EBP]).toString(16)}\n`);
    document.getElementById('consoleOutput').append(`ESI: ${(emu.registers[Register.ESI]).toString(16)}\n`);
    document.getElementById('consoleOutput').append(`EDI: ${(emu.registers[Register.EDI]).toString(16)}\n`);
}

function mainFunc() {
    let emu = new Emulator(0x7c00, 0x7c00);
    resetTextBox();
    readBinary(emu, memory);
    while(emu.eip < MEMOEY_SIZE) {
        let code = get_code8(emu, 0);
        
        if (instructions[code] == null) {
            outputText(`Not Implemented: ${code}`);
            break;
        }

        try {
            instructions[code](emu);
            outputText(`opcode: 0x${(code).toString(16)}`);
            writeEmu(emu);
        } catch (e) {
            outputText(`Not Implemented: 0x${(code).toString(16)}`);
            throw new Error(e);
        }

        if (emu.eip == 0x00) {
            outputText(`end of program. `);
            break;
        }
    }
}

let inputfile = document.getElementById("inputfile");
inputfile.addEventListener("change", event => {
    return onAddFile(event);
}, false);
