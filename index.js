import { get_code8 } from "./emulator_function.js";
import instructions from "./instruction.js";

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
        console.log("this.register: ", this.registers);
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

function writeEmu(code, emu) {
    document.getElementById('result').append(`\ropcode: ${code}\n`);
    document.getElementById('result').append(`EAX: ${(emu.registers[Register.EAX]).toString(16)}\n`);
    document.getElementById('result').append(`ECX: ${(emu.registers[Register.ECX]).toString(16)}\n`);
    document.getElementById('result').append(`EDX: ${(emu.registers[Register.EDX]).toString(16)}\n`);
    document.getElementById('result').append(`EBX: ${(emu.registers[Register.EBX]).toString(16)}\n`);
    document.getElementById('result').append(`ESP: ${(emu.registers[Register.ESP]).toString(16)}\n`);
    document.getElementById('result').append(`EBP: ${(emu.registers[Register.EBP]).toString(16)}\n`);
    document.getElementById('result').append(`ESI: ${(emu.registers[Register.ESI]).toString(16)}\n`);
    document.getElementById('result').append(`EDI: ${(emu.registers[Register.EDI]).toString(16)}\n`);
}

function mainFunc() {
    let emu = new Emulator(0x7c00, 0x7c00);
    readBinary(emu, memory);
    while(emu.eip < MEMOEY_SIZE) {
        let code = get_code8(emu, 0);
        
        if (instructions[code] == null) {
            console.log(`Not Implemented: ${code}`);
            break;
        }

        instructions[code](emu);
        writeEmu(`0x${(code).toString(16)}`, emu);

        if (emu.eip == 0x00) {
            console.log(`end of program. `);
            console.log("emu: ", emu);
            break;
        }
    }
}

let inputfile = document.getElementById("inputfile");
inputfile.addEventListener("change", event => {
    return onAddFile(event);
}, false);
