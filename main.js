const MEMOEY_SIZE = 1024 * 1024;

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
        this.memory = [0];
        this.eip = eip;
        this.registers[Register.ESP] = esp;
    }
}

